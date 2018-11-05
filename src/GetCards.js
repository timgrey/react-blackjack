import React, { Component } from 'react';
import DisplayCards from "./DisplayCards"
import axios from "axios";
import Home from "./Home"

const shuffleDeckUrl = `https://vschool-cors.herokuapp.com?url=https://deckofcardsapi.com/api/deck/0xbbumymhgwo/shuffle/
`
const newDeckUrl = `https://vschool-cors.herokuapp.com?url=https://deckofcardsapi.com/api/deck/0xbbumymhgwo/draw/?count=416`


export default class getCards extends Component {
    constructor() {
        super();
        this.state = {
            deck: [],
            playerCards: [],
            dealerCards: [],
            message: "",
            roundOver: true,
            gameOver: false,
            dealerAces: 0,
            playerAces: 0,
            dealersCardsValue: null,
            playersCardsValue: null,
            bet: 0,
            wallet: 1000,
            loading: true,
            err: null
        }

        this.placeBet = this.placeBet.bind(this)
        this.handleBet = this.handleBet.bind(this)
        this.stand = this.stand.bind(this)
        this.dealersTurn = this.dealersTurn.bind(this)
        this.hit = this.hit.bind(this)
        this.playersTurn = this.playersTurn.bind(this)
        this.newRound = this.newRound.bind(this)
        this.fixCards = this.fixCards.bind(this)
        this.dealCards = this.dealCards.bind(this);
        this.getDeck = this.getDeck.bind(this)
        this.handleNewDeck = this.handleNewDeck.bind(this)
        this.dealDeck = this.dealtDeck.bind(this)

    }

    placeBet(prevState, bet) {
        if (bet < 0) {
            prevState.wallet += (prevState.bet - 10)
            prevState.bet = 10
        } else if (prevState.wallet - bet >= 0) {
            prevState.bet += bet
            prevState.wallet -= bet
        }

        return prevState
    }

    handleBet(bet) {
        return () => this.setState(prevState => this.placeBet({ ...prevState }, bet))
    }

    stand(prevState) {
        prevState.dealerCards[1].flipped = true

        if (prevState.dealersCardsValue === 21) {

            prevState.message = "Dealer Blackjack..."
            if (prevState.wallet < 10) {
                prevState.message = "GAME OVER"
                prevState.gameOver = true
            }
            else {
                prevState.bet = 10
            }
        }

        while (prevState.dealersCardsValue < 17) {
            prevState.dealerCards.push(prevState.deck.pop())
            prevState.dealerCards[prevState.dealerCards.length - 1].flipped = true
            if (prevState.dealerCards[prevState.dealerCards.length - 1].value === "11") {
                prevState.dealerAces++
            }
            prevState.dealersCardsValue += Number(prevState.dealerCards[prevState.dealerCards.length - 1].value)
            if (prevState.dealersCardsValue > 21 && prevState.dealerAces > 0) {
                prevState.dealersCardsValue -= 10
                prevState.dealerAces--
            }
        }

        if (prevState.dealersCardsValue > 21) {
            prevState.message = "Dealer busted!"
            prevState.wallet += (prevState.bet * 2)
            prevState.bet = 0

        } else if (prevState.dealersCardsValue > prevState.playersCardsValue) {
            prevState.message = "Dealer wins!"
            if (prevState.wallet < 10) {
                prevState.message = "GAME OVER"
                prevState.gameOver = true
            }
            else {
                prevState.bet = 0
            }
        } else if (prevState.dealersCardsValue < prevState.playersCardsValue) {
            prevState.message = "You win!"
            prevState.wallet += (prevState.bet * 2)
            prevState.bet = 0
        }
        else if (prevState.dealersCardsValue === prevState.playersCardsValue) {
            prevState.message = "No winner!"
            prevState.wallet += prevState.bet;
            prevState.bet = 0
        }

        prevState.roundOver = true;
        return prevState;
    }


    dealersTurn() {
        this.setState(prevState => this.stand({ ...prevState }))
    }


    hit(prevState) {
        prevState.playerCards.push(prevState.deck.pop())
        if (prevState.playerCards[prevState.playerCards.length - 1].value === "11") {
            prevState.playerAces++
        }
        prevState.playerCards[prevState.playerCards.length - 1].flipped = true
        prevState.playersCardsValue += Number(prevState.playerCards[prevState.playerCards.length - 1].value)
        if (prevState.playersCardsValue > 21 && prevState.playerAces === 0) {
            prevState.message = "You Busted!";
            prevState.dealerCards[1].flipped = true;
            prevState.roundOver = true;
            if (prevState.wallet < 10) {
                prevState.message = "GAME OVER"
                prevState.gameOver = true
            }
        } else if (prevState.playersCardsValue > 21 && prevState.playerAces > 0) {
            prevState.playersCardsValue -= 10
            prevState.playerAces--
        }
        return prevState
    }


    playersTurn() {
        this.setState(prevState => this.hit({ ...prevState }))
    }


    newRound() {
        this.setState(prevState => this.dealCards({ ...prevState }))
    }


    fixCards(deck) {
        return deck.map(function (card) {

            //Assignes Numerical Values to Ace,King,Queen, and Jacks
            if (card.value === "ACE") {
                card.value = "11"
            } else if (card.value === "KING") {
                card.value = "10"
            } else if (card.value === "QUEEN") {
                card.value = "10"
            } else if (card.value === "JACK") {
                card.value = "10"
            }

            //Assigns a flipped status of card for displaying purposes.
            card.flipped = false;

            return card
        })
    }


    dealCards(prevState) {

        if (prevState.wallet < 10 && prevState.gameOver) {
            prevState.wallet = 990
            prevState.bet = 10
            prevState.gameOver = false;
        }

        if (prevState.bet < 10) {
            prevState.wallet -= 10
            prevState.bet = 10
        }
        prevState.dealerCards = []
        prevState.playerCards = []
        prevState.dealerAces = 0
        prevState.playerAces = 0
        prevState.message = ''
        prevState.dealersCardsValue = 0
        prevState.playersCardsValue = 0
        prevState.roundOver = false

        if (prevState.deck.length < 40) this.dealtDeck()

        prevState.deck = this.state.deck;

        while (prevState.playerCards.length < 2) {
            prevState.playerCards.push(prevState.deck.pop())
            if (prevState.playerCards[prevState.playerCards.length - 1].value === "11") {
                if (prevState.playerAces > 1) {
                    prevState.playerCards[1].value = "1"
                } else {
                    prevState.playerAces++
                }
            }
            prevState.playerCards[prevState.playerCards.length - 1].flipped = true;
            prevState.playersCardsValue += Number(prevState.playerCards[prevState.playerCards.length - 1].value)

        }

        while (prevState.dealerCards.length < 2) {
            prevState.dealerCards.push(prevState.deck.pop())
            if (prevState.dealerCards[prevState.dealerCards.length - 1].value === "11") {
                prevState.dealerAces++
            }
            prevState.dealersCardsValue += Number(prevState.dealerCards[prevState.dealerCards.length - 1].value)

        }
        prevState.dealerCards[0].flipped = true;

        if (Number(prevState.playersCardsValue === 21)) {
            prevState.roundOver = true;
            prevState.message = "BLACKJACK!"
            prevState.bet *= 3
            prevState.wallet += prevState.bet
        }
        return prevState
    }


    handleDealCards(prevState) {

        //Runs function that fixes values of
        //Kings, Queens, Jack, and Aces
        this.fixCards(prevState.deck)

        //Returns updated state
        return prevState;
    }


    getDeck() {
        const deckRequest = () => axios.get(newDeckUrl).then(response => response.data.cards);

        return axios.get(shuffleDeckUrl).then(deckRequest)
    }


    handleNewDeck() {
        return this.getDeck().then(deck => this.setState({ deck }))
    }


    dealtDeck() {
        return this.handleNewDeck().then(() => this.setState(prevState => this.handleDealCards({ ...prevState })))
    }


    componentDidMount() {
        this.dealtDeck()
            .then(response => {
                this.setState({ loading: false, err: null })
            })
            .catch(err => this.setState({ loading: false, err: { message: "Error 404" } }))
    }


    render() {
        const { loading, err, roundOver, wallet, bet } = this.state
        return (
            <div className="body-wrapper">
                <div className="app">
                    {loading ?
                        <Home />
                        :
                        err ?
                            <p>{err.message}</p>
                            :
                            <DisplayCards {...this.state} />
                    }

                    {roundOver ?
                        <div className="bet-buttons">
                            <div className="bet">
                                <button onClick={this.handleBet(-1)}>MIN</button>
                                <button onClick={this.handleBet(10)}>$10</button>
                                <button onClick={this.handleBet(50)}>$50</button>
                                <button onClick={this.handleBet(100)}>$100</button>
                                <button onClick={this.handleBet(wallet)}>MAX</button>
                            </div>
                            <div className="deal">
                                <button onClick={this.newRound}>Deal</button>
                            </div>
                        </div>
                        :
                        <div className="buttons">
                            <div>
                                <button className= "stand" onClick={this.dealersTurn}>Stand</button>
                                <button className= "hit" onClick={this.playersTurn}>Hit</button>
                            </div>
                        </div>
                    }

                    <div className="money">
                        <div className="currentBet">Current Bet: ${bet}</div>
                        <div className="wallet">${wallet}</div>
                    </div>

                </div>
            </div>
        )
    }
}




