package com.tripwithus.repository;

import com.tripwithus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);
}
