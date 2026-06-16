package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.LoginRequestDto;
import com.project.tech_gadget_store.dto.request.RegisterRequestDto;
import com.project.tech_gadget_store.dto.response.LoginResponseDto;
import com.project.tech_gadget_store.security.AccountUserDetails;
import com.project.tech_gadget_store.service.AuthService;
import com.project.tech_gadget_store.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthService authService;

    public AuthController(AuthenticationManager authenticationManager,
            JwtService jwtService,
            AuthService authService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        AccountUserDetails details = (AccountUserDetails) auth.getPrincipal();
        String token = jwtService.generateToken(details);
        return ResponseEntity.ok(new LoginResponseDto(
                token,
                details.getUsername(),
                details.getFullName(),
                details.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@Valid @RequestBody RegisterRequestDto req) {
        LoginResponseDto response = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
