use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};
pub const PREFIX: &str="ZKGame";
pub const CURRENT_GAME_PREFIX: &str="ZKGameCurrent";

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq,Clone,Copy,Debug)]
pub struct Point{
    x: u8,
    y: u8
}

impl Point{

    pub fn get_x(&self)->u8{
        self.x
    }

    pub fn get_y(&self)->u8{
        self.y
    }
    

    pub fn new(x: u8, y: u8)->Self{
        Point{
            x,y
        }
    }

    pub fn matches(&self, point: &Point)->bool{
        self.x==point.get_x() && self.y==point.get_y()
    }
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug,Copy)]
#[repr(u8)]
pub enum GameState {
    Setup,
    Start,
    End,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug,Copy)]
#[repr(u8)]
pub enum PlayerTurnResult {
    Same,
    Near,
    Far,
    Exact
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug,Copy)]
#[repr(u8)]
pub enum Players {
    Player1,
    Player2
}

