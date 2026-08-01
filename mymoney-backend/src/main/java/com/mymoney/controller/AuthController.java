package com.mymoney.controller;

import com.mymoney.config.JWTUtil;
import com.mymoney.dto.AuthRequest;
import com.mymoney.dto.AuthResponse;
import com.mymoney.dto.RegisterRequest;
import com.mymoney.model.User;
import com.mymoney.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.registerUser(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails.getUsername());
        
        User user = userService.findByUsername(userDetails.getUsername());

        return ResponseEntity.ok(AuthResponse.builder()
                .jwt(jwt)
                .username(user.getUsername())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .darkTheme(user.getDarkTheme())
                .profilePicture(user.getProfilePicture())
                .build());
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String picture = request.get("picture");

        if (email == null || email.isEmpty()) {
            throw new com.mymoney.exception.BadRequestException("Email is required for Google login");
        }

        User user = userService.registerOrLoginGoogleUser(email, name, picture);
        final String jwt = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(AuthResponse.builder()
                .jwt(jwt)
                .username(user.getUsername())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .darkTheme(user.getDarkTheme())
                .profilePicture(user.getProfilePicture())
                .build());
    }
}
