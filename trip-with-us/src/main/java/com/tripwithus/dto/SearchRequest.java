package com.tripwithus.dto;

import lombok.Data;

@Data
public class SearchRequest {
    private String from;
    private String to;
    private String date;
}
