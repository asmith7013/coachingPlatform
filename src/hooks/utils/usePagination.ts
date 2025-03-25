import { useState } from "react";

export function usePagination(initialPage: number = 1, initialLimit: number = 20) {
    const [page, setPage] = useState<number>(initialPage);
    const [limit, setLimit] = useState<number>(initialLimit);
    const [total, setTotal] = useState<number>(0);

    return { page, setPage, limit, setLimit, total, setTotal };
}