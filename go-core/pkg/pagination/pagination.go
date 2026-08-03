package pagination

type Response[T any] struct {
	Items      T   `json:"items"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"totalPages"`
}

func New[T any](items T, page, limit, total int) Response[T] {
	totalPages := 0

	if limit > 0 {
		totalPages = total / limit
		if total%limit != 0 {
			totalPages++
		}
	}

	return Response[T]{
		Items:      items,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
}
