package com.example.filodiscuss.features.auth.presentation.state

import com.example.filodiscuss.features.auth.domain.model.User

sealed class RegisterState {
    data object Idle : RegisterState()
    data object Loading : RegisterState()
    data class Success(val user: User) : RegisterState()
    data class Error(val message: String) : RegisterState()
}