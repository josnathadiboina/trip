package com.tripwithus.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private Integer age;
    private String mobileNumber;
    private String email;
    private String password;
    private String location;
}
