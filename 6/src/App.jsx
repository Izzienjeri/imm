import { useState, useEffect, useRef } from "react";
import "./App.css";
import { Heart, Club, Diamond, Spade } from "lucide-react";

function App() {
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [deck, setDeck] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [dealerHidden, setDealerHidden] = useState(true);
  const deckExhausted = useRef(false);
  const [shuffling, setShuffling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [reshuffling, setReshuffling] = useState(false);
  const [hiddenDealerScore, setHiddenDealerScore] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [handedInitialCards, setHandedInitialCards] = useState(false);
  const [dealerTurnedIn, setDealerTurnedIn] = useState(false);

  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  const createDeck = () => {
    const newDeck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        let value = parseInt(rank);
        if (["J", "Q", "K"].includes(rank)) {
          value = 10;
        } else if (rank === "A") {
          value = 11;
        }
        newDeck.push({ suit, rank, value });
      }
    }
    return newDeck;
  };

  const shuffleDeck = (deck) => {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  };

  const calculateScore = (cards) => {
    let score = cards.reduce((sum, card) => sum + card.value, 0);
    let hasAce = cards.some((card) => card.rank === "A" && card.value === 11);

    while (score > 21 && hasAce) {
      const aceIndex = cards.findIndex(
        (card) => card.rank === "A" && card.value === 11
      );
      if (aceIndex !== -1) {
        cards[aceIndex].value = 1;
        score -= 10;
        hasAce = cards.some((card) => card.rank === "A" && card.value === 11);
      } else {
        hasAce = false;
      }
    }
    return score;
  };

  const dealCard = (currentDeck) => {
    if (currentDeck.length === 0) {
      deckExhausted.current = true;
      return null;
    }
    const card = currentDeck.pop();
    return card;
  };

  const dealInitialHands = async (shuffledDeck) => {
    const initialPlayerCards = [];
    const initialDealerCards = [];
    let tempDeck = [...shuffledDeck];

    initialDealerCards.push(dealCard(tempDeck));
    setDealerCards([...initialDealerCards]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    initialPlayerCards.push(dealCard(tempDeck));
    setPlayerCards([...initialPlayerCards]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    initialDealerCards.push(dealCard(tempDeck));
    setDealerCards([...initialDealerCards]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    initialPlayerCards.push(dealCard(tempDeck));
    setPlayerCards([...initialPlayerCards]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setDeck(tempDeck);
    setHiddenDealerScore(
      calculateScore([initialDealerCards[0], initialDealerCards[1]])
    );
    setHandedInitialCards(true);
  };

  const startGame = async () => {
    setGameStarted(true);
    setShuffling(true);
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerScore(0);
    setDealerScore(0);
    setIsPlayerTurn(false);
    setGameOver(false);
    setGameResult(null);
    setDealerHidden(true);
    deckExhausted.current = false;
    setShowResultDialog(false);
    setHandedInitialCards(false);
    setDealerTurnedIn(false);
    setShowResultDialog(false);

    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShuffling(false);
    setIsPlayerTurn(true);
    setGameOver(false);
    setGameResult(null);

    await dealInitialHands(shuffledDeck);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reshuffleDeck = async () => {
    setReshuffling(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newDeck = createDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setDeck(shuffledDeck);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setReshuffling(false);
  };

  useEffect(() => {
    if (gameOver) return;
    setPlayerScore(calculateScore(playerCards));
    if (!dealerHidden) {
      setDealerScore(calculateScore(dealerCards));
    }
  }, [playerCards, dealerCards, gameOver, gameStarted, dealerHidden]);

  useEffect(() => {
    if (dealerHidden && gameStarted) {
      setDealerScore(hiddenDealerScore);
    } else if (!dealerHidden && gameStarted) {
      setDealerScore(calculateScore(dealerCards));
    }
  }, [dealerHidden, dealerCards, gameStarted, hiddenDealerScore]);

  useEffect(() => {
    if (!dealerTurnedIn) return;

    if (playerScore > 21) {
      setGameResult("Dealer Wins!");
    } else if (dealerScore > 21) {
      setGameResult("Player Wins!");
    } else if (playerScore === dealerScore) {
      setGameResult("Push!");
    } else if (playerScore > dealerScore) {
      setGameResult("Player Wins!");
    } else {
      setGameResult("Dealer Wins!");
    }

    setGameOver(true);
    setIsPlayerTurn(false);
    setDealerHidden(false);
  }, [dealerScore, dealerTurnedIn, playerScore]);

  useEffect(() => {
    if (!dealerTurnedIn && playerScore == 21) handleStand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerScore]);

  useEffect(() => {
    if (deck.length < 10 && !gameOver && !reshuffling && gameStarted) {
      deckExhausted.current = true;
      reshuffleDeck();
    }
  }, [isPlayerTurn, gameOver, deck, gameStarted, reshuffling, reshuffleDeck]);

  const handleHit = async () => {
    if (!gameOver && isPlayerTurn) {
      let tempDeck = [...deck];
      const newCard = dealCard(tempDeck);
      if (newCard) {
        const updatedPlayerCards = [...playerCards, newCard];
        setPlayerCards(updatedPlayerCards);
        setDeck(tempDeck);

        const newScore = calculateScore(updatedPlayerCards);
        setPlayerScore(newScore);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (newScore > 21) {
          setShowResultDialog(true);
          setGameResult("Dealer Wins!");
          setGameOver(true);
          setIsPlayerTurn(false);
          setDealerHidden(false);
        }
      } else {
        setGameResult("Out of cards! Game over.");
        setGameOver(true);
        setIsPlayerTurn(false);
        setDealerHidden(false);
      }
    }
  };

  const handleStand = async () => {
    setDealerHidden(false);
    if (isPlayerTurn && !gameOver) {
      setIsPlayerTurn(false);
      setDealerHidden(false);
      await dealerTurnLogic();
    }
  };

  const dealerTurnLogic = async () => {
    await dealerPlay();
    setDealerTurnedIn(true);
  };

  const dealerPlay = async () => {
    let dealerHand = [...dealerCards];
    let dealerTotal = calculateScore(dealerHand);
    let tempDeck = [...deck];

    while (dealerTotal < 17 && !gameOver) {
      const newCard = dealCard(tempDeck);
      if (newCard) {
        dealerHand = [...dealerHand, newCard];
        setDealerCards(dealerHand);
        dealerTotal = calculateScore(dealerHand);
        setDeck(tempDeck);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        setGameResult("Out of cards! Game over.");
        setGameOver(true);
        setIsPlayerTurn(false);
        setDealerHidden(false);
        return;
      }
    }

    if (dealerTotal > 21) {
      setGameResult("Player Wins!");
    } else if (dealerTotal > playerScore) {
      setGameResult("Dealer Wins!");
    } else if (dealerTotal < playerScore) {
      setGameResult("Player Wins!");
    } else {
      setGameResult("Push!");
    }
    setGameOver(true);
    setDealerHidden(false);
    setShowResultDialog(true);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleKeyDown = (e) => {
    if (e.key === "+" && isPlayerTurn && !gameOver) {
      handleHit();
    } else if (e.key === "k" && isPlayerTurn && !gameOver) {
      handleStand();
    } else if (e.key === "Enter" && !gameStarted) {
      startGame();
    } else if (
      e.key === "Enter" &&
      showResultDialog &&
      gameOver &&
      gameResult
    ) {
      startGame();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlayerTurn, gameOver, playerCards, deck, gameStarted, handleKeyDown]);

  const Card = ({ card, index, hidden }) => {
    const cardAngle = index * 8;

    const getSuitSymbolComponent = (suit) => {
      switch (suit) {
        case "hearts":
          return <Heart size={48} color="#ff0000" strokeWidth={3} />;
        case "diamonds":
          return <Diamond size={48} color="#ff0000" strokeWidth={3} />;
        case "clubs":
          return <Club size={48} color="#000000" strokeWidth={3} />;
        case "spades":
          return <Spade size={48} color="#000000" strokeWidth={3} />;
        default:
          return null;
      }
    };

    const cardStyle = {
      transform: `rotate(${cardAngle}deg)`,
      marginLeft: index > 0 ? `-${8 * 2}px` : "0px",
    };

    if (hidden) {
      return (
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl text-gray-900 w-24 h-36 sm:w-32 sm:h-48 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-inner backface-hidden" // Added backface-hidden
          style={{
            background: "linear-gradient(to bottom, #374151, #1f2937)",
            ...cardStyle,
          }}
        >
          <div className="absolute top-4 left-4 text-xl font-semibold drop-shadow"></div>
          <div className="text-6xl drop-shadow text-white"></div>
          <div className="absolute bottom-4 right-4 text-xl font-semibold drop-shadow"></div>
        </div>
      );
    } else {
      return (
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl text-gray-900 w-24 h-36 sm:w-32 sm:h-48 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-inner"
          style={{
            background: "linear-gradient(to bottom, #f3f4f6, #e5e7eb)",
            ...cardStyle,
          }}
        >
          <div className="absolute top-4 left-4 text-xl font-semibold drop-shadow">
            {card?.rank}
          </div>
          <div className="text-4xl sm:text-6xl drop-shadow">
            {getSuitSymbolComponent(card?.suit)}
          </div>
          <div className="absolute bottom-4 right-4 text-xl font-semibold drop-shadow">
            {card?.rank}
          </div>
        </div>
      );
    }
  };

  const GameBoard = ({ cards, score, isDealer, hidden }) => (
    <div className="mb-4 sm:mb-8 p-2 sm:p-4">
      <h2 className="text-lg md:text-xl font-extrabold text-white text-shadow-lg mb-2 sm:mb-4">
        {isDealer ? "Dealer" : "Player"}
        {isDealer && hidden ? null : (
          <span className="text-lg md:text-xl">({score})</span>
        )}
      </h2>
      <div className="flex flex-wrap justify-center">
        {cards.map((card, index) =>
          isDealer && hidden && index === 0 ? (
            <Card key={index} card={card} index={index} hidden={true} />
          ) : (
            <Card key={index} card={card} index={index} />
          )
        )}
      </div>
    </div>
  );

  const GameMessage = ({ result }) => (
    <div
      className="mb-4 sm:mb-8 text-2xl sm:text-3xl font-black text-center text-black text-shadow-xl tracking-wide uppercase"
      aria-live="polite"
    >
      {result && (
        <div className="relative">
          <p className="mb-2 sm:mb-4">{result}</p>
        </div>
      )}
    </div>
  );

  const Button = ({ children, onClick, disabled, ariaLabel, tooltip }) => (
    <div className="relative group">
      <button
        className="relative overflow-hidden transition-all duration-200 ease-in-out bg-gradient-to-br from-gray-900 to-gray-700 hover:from-gray-700 hover:to-gray-900 text-white font-extrabold py-2 sm:py-3 px-4 sm:px-8 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </button>
      {tooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs sm:text-sm py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none min-w-max ">
          {tooltip}
        </div>
      )}
    </div>
  );

  const PlusButton = () => (
    <Button
      onClick={handleHit}
      disabled={!isPlayerTurn || gameOver || deckExhausted.current}
      ariaLabel="Hit"
      tooltip="Draw another card (Press + in keyboard)"
    >
      +
    </Button>
  );

  const KButton = () => (
    <Button
      onClick={handleStand}
      disabled={!isPlayerTurn || gameOver}
      ariaLabel="Stand"
      tooltip="End your turn (Press K in keyboard)"
    >
      K
    </Button>
  );

  const StartGameButton = () => (
    <Button onClick={() => startGame()} ariaLabel="Start Game">
      Start Now
    </Button>
  );

  const Title = () => (
    <div className="text-center">
      <h1 className="text-4xl sm:text-6xl text-white uppercase font-extrabold">
        21 Game
      </h1>
    </div>
  );

  const DeckExhaustedMessage = () => (
    <div className="text-gray-400 text-center mt-4 sm:mt-8 text-lg sm:text-xl font-semibold drop-shadow animate-pulse transition-opacity duration-200">
      {reshuffling
        ? "Reshuffling the deck..."
        : gameOver
        ? "The deck is exhausted. Please start a new game."
        : "The deck is running low. Reshuffling soon!"}
    </div>
  );

  const GameResultDialog = ({ result }) => {
    return showResultDialog && gameOver && result ? (
      <div className="fixed top-0 left-0 w-full h-full bg-stone-950 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            {result}
          </h2>

          <Button
            onClick={() => startGame()}
            ariaLabel="Deal Again"
            tooltip="Deal again (Press Enter)"
          >
            Deal Again
          </Button>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col items-center justify-center bg-stone-950 p-4 font-[inter]">
      {" "}
      {/* Added padding for smaller screens */}
      {!gameStarted && (
        <header className="mb-4 sm:mb-8">
          <Title />
        </header>
      )}
      {!gameStarted ? (
        <div className="text-center">
          <p className="text-lg sm:text-xl text-slate-400 mb-4 sm:mb-6">
            Press Enter or Click Start Game to Begin!
          </p>
          <StartGameButton />
        </div>
      ) : (
        <main className="w-full max-w-lg">
          {" "}
          {shuffling ? (
            <div className="text-center bg-white rounded-lg text-black py-1 sm:py-2 px-2 sm:px-4 text-2xl sm:text-3xl font-bold animate-pulse">
              Shuffling the deck...
            </div>
          ) : (
            <>
              <GameBoard
                cards={dealerCards}
                score={dealerScore}
                isDealer={true}
                hidden={dealerHidden}
              />
              <GameBoard
                cards={playerCards}
                score={playerScore}
                isDealer={false}
              />

              <div className="flex justify-center space-x-4 sm:space-x-6 mb-4 sm:mb-8">
                {handedInitialCards && (
                  <>
                    <PlusButton />
                    <KButton />
                  </>
                )}
              </div>

              <GameMessage result={gameResult} />
            </>
          )}
        </main>
      )}
      {deckExhausted.current && gameStarted && <DeckExhaustedMessage />}
      <GameResultDialog result={gameResult} />
    </div>
  );
}

export default App;