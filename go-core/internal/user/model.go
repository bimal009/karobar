package user

type UserRole string

const (
	UserRoleAdmin UserRole = "admin"
	UserRoleOwner UserRole = "owner"
	UserRoleUser  UserRole = "user"
)
