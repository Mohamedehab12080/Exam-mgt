package com.iti.training.api.repository.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaginationInfo {
    @Builder.Default
    private Integer pageNum = 0;

    private Integer pageOffset;

    @Builder.Default
    private Integer pageSize = 25;

    @Builder.Default
    private Boolean noPagination = false;

    public static PaginationInfo noPagination() {
        return PaginationInfo.builder().noPagination(false).build();
    }

    public static PaginationInfo firstItem() {
        return PaginationInfo.builder().pageNum(0).pageSize(1).build();
    }

    public boolean isApplied() {
        return noPagination;
    }
}
