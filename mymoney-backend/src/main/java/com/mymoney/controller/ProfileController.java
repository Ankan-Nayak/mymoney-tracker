package com.mymoney.controller;

import com.mymoney.dto.PasswordRequest;
import com.mymoney.dto.ProfileRequest;
import com.mymoney.model.User;
import com.mymoney.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<User> getProfile(Principal principal) {
        return ResponseEntity.ok(userService.findByUsername(principal.getName()));
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody ProfileRequest request, Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping(value = "/avatar", consumes = {"multipart/form-data"})
    public ResponseEntity<User> uploadAvatar(
            @RequestPart("file") MultipartFile file,
            Principal principal
    ) throws IOException {
        return ResponseEntity.ok(userService.uploadProfilePicture(principal.getName(), file));
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody PasswordRequest request,
            Principal principal
    ) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(Principal principal) {
        userService.deleteAccount(principal.getName());
        return ResponseEntity.ok().build();
    }
}
