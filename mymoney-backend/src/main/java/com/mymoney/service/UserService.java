package com.mymoney.service;

import com.mymoney.dto.PasswordRequest;
import com.mymoney.dto.ProfileRequest;
import com.mymoney.dto.RegisterRequest;
import com.mymoney.exception.BadRequestException;
import com.mymoney.exception.ResourceNotFoundException;
import com.mymoney.model.User;
import com.mymoney.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${mymoney.upload.dir}")
    private String uploadDir;

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public User registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCurrency("USD");
        user.setDarkTheme(false);

        return userRepository.save(user);
    }

    public User updateProfile(String username, ProfileRequest request) {
        User user = findByUsername(username);
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getCurrency() != null) {
            user.setCurrency(request.getCurrency());
        }
        if (request.getDarkTheme() != null) {
            user.setDarkTheme(request.getDarkTheme());
        }
        return userRepository.save(user);
    }

    public User uploadProfilePicture(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username);
        
        // Ensure upload folder exists
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        user.setProfilePicture("/uploads/" + fileName);
        return userRepository.save(user);
    }

    public void changePassword(String username, PasswordRequest request) {
        User user = findByUsername(username);
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void deleteAccount(String username) {
        User user = findByUsername(username);
        userRepository.delete(user);
    }

    public User registerOrLoginGoogleUser(String email, String username, String picture) {
        java.util.Optional<User> existingEmail = userRepository.findByEmail(email);
        if (existingEmail.isPresent()) {
            User user = existingEmail.get();
            if ((user.getProfilePicture() == null || user.getProfilePicture().isEmpty()) && picture != null) {
                user.setProfilePicture(picture);
                userRepository.save(user);
            }
            return user;
        }

        String finalUsername = username;
        if (finalUsername == null || finalUsername.isEmpty()) {
            finalUsername = email.split("@")[0];
        }
        String baseUsername = finalUsername;
        int count = 1;
        while (userRepository.findByUsername(finalUsername).isPresent()) {
            finalUsername = baseUsername + count;
            count++;
        }

        User user = new User();
        user.setUsername(finalUsername);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setProfilePicture(picture);
        user.setCurrency("USD");
        user.setDarkTheme(false);

        return userRepository.save(user);
    }
}
