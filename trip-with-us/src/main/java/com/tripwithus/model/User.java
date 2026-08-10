package com.tripwithus.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_user")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private Integer age;

    @NotBlank
    @Column(unique = true)
    private String mobileNumber;

    @Email
    @Column(unique = true)
    private String email;

    @JsonIgnore
    @NotBlank
    private String password;

    private String location;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    public enum Role { USER, ADMIN }
}
