package com.tripwithus.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username; // mobile number or admin username
    private String password;
}
