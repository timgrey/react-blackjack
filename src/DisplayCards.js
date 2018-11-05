import React from "react"
import backOfCard from "./images/back-of-card.png";


function displayCards({ message, playerCards, dealerCards, playersCardsValue, dealersCardsValue }) {

    const dealerElements = dealerCards => {

        return dealerCards.map(function (card, index) {
            if (card.flipped) {
                return <img src={dealerCards[index].images.png} alt="" />
            } else {
                return <img src={backOfCard} alt="" />
            }
        })

    }

    const displayMessage = message => <p>{message}</p>

    const playerElements = playerCards => {

        return playerCards.map(function (card, index) {
            return <img src={playerCards[index].images.png} alt="" />
        })
    }


 


    return (
        <div className="game-board">
            <div className="dealer-section">
                <div className="counter">{dealersCardsValue}</div>
                <div className="dealer-cards">{dealerElements(dealerCards)}</div>
            </div>
            <div className="message">
                {displayMessage(message)}
            </div>
            <div className="player-section">
                <div className="player-cards">{playerElements(playerCards)}</div>
                <div className="counter">{playersCardsValue}</div>
            </div>

        </div>
    )
}
export default displayCards