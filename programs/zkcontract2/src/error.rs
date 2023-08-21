use anchor_lang::solana_program::program_error::ProgramError;
use anchor_lang::prelude::*;

#[error_code]
pub enum GameError{
    #[msg("Game not in init state")]
    GameNotInit,
    #[msg("Player move not done by correct player")]
    InvalidPlayer,
    #[msg("Cannot move to same position")]
    SamePositionError,
    #[msg("Player 1 can verify the move")]
    InvalidMovePlayer,
    #[msg("Proof verifying error")]
    VerifyError,
    #[msg("Wrong hash")]
    WrongHashError,
    #[msg("Wrong Player")]
    OtherPlayersTurn,
}


impl From<GameError> for ProgramError {
    fn from(e: GameError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
