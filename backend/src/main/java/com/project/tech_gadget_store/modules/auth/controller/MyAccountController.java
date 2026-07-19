package com.project.tech_gadget_store.modules.auth.controller;

import com.project.tech_gadget_store.modules.auth.dto.request.ChangeMyPasswordRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.MyProfileResponseDto;
import com.project.tech_gadget_store.modules.auth.service.MyAccountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/account/me")
public class MyAccountController {

    private final MyAccountService myAccountService;

    public MyAccountController(MyAccountService myAccountService) {
        this.myAccountService = myAccountService;
    }

    @GetMapping
    public ResponseEntity<MyProfileResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(myAccountService.getMyProfile(authentication.getName()));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangeMyPasswordRequestDto req) {
        myAccountService.changeMyPassword(authentication.getName(), req);
        return ResponseEntity.noContent().build();
    }
}
