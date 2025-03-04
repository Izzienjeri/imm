/**
 * Connect4Game is a React-based implementation of the classic Connect Four game.
 * It provides a two-player experience where players take turns dropping pieces into
 * a grid, attempting to connect four in a row vertically, horizontally, or diagonally.
 * 
 * Features:
 * - Interactive game board using React state and animations.
 * - Dynamic player customization (names and colors).
 * - Game logic including win detection and draw conditions.
 * - Visual feedback for turns, winning moves, and game-over state.
 * - Sound effects for interactions.
 * - Responsive design for mobile and desktop.
 * - Ability to restart or continue playing.
 * 
 * Dependencies:
 * - React (useState, useEffect, useCallback, useMemo, useRef)
 * - UI components from `shadcn`
 * - Motion animations from `framer-motion`
 * - Sound generation using `tone`
 * - Icons from `lucide-react`
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  RotateCw,
  Trophy,
  Users,
  Palette,
  PlayCircle,
  Volume2,
  VolumeX,
  Info,
  CheckCircle,
  Settings,
  Home,
  AlertCircle,
} from "lucide-react";
import * as Tone from "tone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types
interface Player {
  id: number
  name: string
  color: string
  wins: number
}

interface GameState {
  board: (number | null)[][]
  currentPlayer: number
  players: Player[]
  winner: number | null
  isDraw: boolean
  winningCells: { row: number; col: number }[] | null
}

interface ColorOption {
  name: string
  value: string
  textColor: string
}

const Cell = React.memo(
  ({
    cellSize,
    color,
    isWinning,
    isEmpty,
    playerName,
  }: {
    cellSize: string
    color: string
    isWinning: boolean
    isEmpty: boolean
    playerName?: string
  }) => (
    <motion.div
      className={cn(
        cellSize,
        "rounded-full border-2 border-blue-700 flex items-center justify-center",
        isEmpty ? "bg-gray-800" : color,
        isWinning ? "animate-pulse ring-4 ring-yellow-300 ring-opacity-75" : "",
      )}
      initial={!isEmpty ? { y: -50, opacity: 0 } : {}}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: !isEmpty ? "spring" : "tween",
        stiffness: 300,
        damping: 20,
      }}
      aria-label={isEmpty ? "Empty cell" : `${playerName}'s piece`}
    />
  ),
)

const Column = React.memo(
  ({
    col,
    board,
    cellSize,
    players,
    winningCells,
    handleCellClick,
    isGameOver,
    animateColumn,
  }: {
    col: number
    board: (number | null)[][]
    cellSize: string
    players: Player[]
    winningCells: { row: number; col: number }[] | null
    handleCellClick: (col: number) => void
    isGameOver: boolean
    animateColumn: number | null
  }) => {
    const isColumnFull = board[0][col] !== null
    const isWinningCell = useCallback(
      (row: number, col: number) => {
        if (!winningCells) return false
        return winningCells.some((cell) => cell.row === row && cell.col === col)
      },
      [winningCells],
    )

    return (
      <div className="flex flex-col items-center gap-1 sm:gap-2" role="gridcell">
        <motion.div whileHover={{ scale: isGameOver || isColumnFull ? 1 : 1.1 }}>
          <Button
            onClick={() => handleCellClick(col)}
            className={cn(
              "w-10 h-8 sm:w-12 sm:h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all",
              animateColumn === col ? "animate-pulse bg-gray-600" : "",
              isGameOver || isColumnFull ? "opacity-50 cursor-not-allowed" : "",
            )}
            disabled={isGameOver || isColumnFull}
            aria-label={`Drop piece in column ${col + 1}`}
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        </motion.div>
        <div className={cn("rounded-lg bg-blue-800 p-2 sm:p-3", "grid grid-rows-6 gap-1 sm:gap-1.5")}>
          {board.map((row, rowIdx) => (
            <Cell
              key={`${col}-${rowIdx}`}
              cellSize={cellSize}
              color={row[col] === null ? "" : players[row[col]].color}
              isWinning={isWinningCell(rowIdx, col)}
              isEmpty={row[col] === null}
              playerName={row[col] === null ? undefined : players[row[col]].name}
            />
          ))}
        </div>
      </div>
    )
  },
)

// Main component
const Connect4Game = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
    currentPlayer: 0,
    players: [
      { id: 0, name: "Player 1", color: "bg-red-500", wins: 0 },
      { id: 1, name: "Player 2", color: "bg-yellow-500", wins: 0 },
    ],
    winner: null,
    isDraw: false,
    winningCells: null,
  })

  // UI state
  const [playerNames, setPlayerNames] = useState(["", ""])
  const [playerColors, setPlayerColors] = useState(["bg-red-500", "bg-yellow-500"])
  const [gameStarted, setGameStarted] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("setup")
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  const [animateColumn, setAnimateColumn] = useState<number | null>(null)

  // Color options
  const availableColors = useMemo<ColorOption[]>(
    () => [
      { name: "Red", value: "bg-red-500", textColor: "text-white" },
      { name: "Blue", value: "bg-blue-500", textColor: "text-white" },
      { name: "Green", value: "bg-green-500", textColor: "text-white" },
      { name: "Yellow", value: "bg-yellow-500", textColor: "text-white" },
      { name: "Purple", value: "bg-purple-500", textColor: "text-white" },
      { name: "Pink", value: "bg-pink-500", textColor: "text-white" },
      { name: "Cyan", value: "bg-cyan-500", textColor: "text-white" },
      { name: "Orange", value: "bg-orange-500", textColor: "text-white" },
    ],
    [],
  )

  // Sound effects
  const clickSound = useRef<Tone.Synth | null>(null)
  const winSound = useRef<Tone.Synth | null>(null)
  const drawSound = useRef<Tone.Synth | null>(null)
  const dropSound = useRef<Tone.Synth | null>(null)

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)

  // Derived state
  const isGameOver = gameState.winner !== null || gameState.isDraw

  // Initialize sounds and check mobile
  useEffect(() => {
    // Initialize sound effects
    clickSound.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.1 },
    }).toDestination()

    winSound.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.8 },
    }).toDestination()

    drawSound.current = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
    }).toDestination()

    dropSound.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 },
    }).toDestination()

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      clickSound.current?.dispose()
      winSound.current?.dispose()
      drawSound.current?.dispose()
      dropSound.current?.dispose()
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Sound effect functions
  const playClickSound = useCallback(() => {
    if (isSoundEnabled && clickSound.current) {
      clickSound.current.triggerAttackRelease("C5", "16n")
    }
  }, [isSoundEnabled])

  const playDropSound = useCallback(
    (row: number) => {
      if (isSoundEnabled && dropSound.current) {
        const pitch = 440 + (5 - row) * 50
        dropSound.current.frequency.value = pitch
        dropSound.current.triggerAttackRelease(pitch, "16n")
      }
    },
    [isSoundEnabled],
  )

  const playWinSound = useCallback(() => {
    if (isSoundEnabled && winSound.current) {
      winSound.current.triggerAttackRelease("E5", "8n")
      winSound.current?.triggerAttackRelease("G5", "8n")
      winSound.current?.triggerAttackRelease("B5", "8n")
      winSound.current?.triggerAttackRelease("E6", "4n")
    }
  }, [isSoundEnabled])

  const playDrawSound = useCallback(() => {
    if (isSoundEnabled && drawSound.current) {
      drawSound.current.triggerAttackRelease("C4", "8n")
      drawSound.current?.triggerAttackRelease("G3", "8n")
    }
  }, [isSoundEnabled])

  // Function to check for winner
  const checkWinner = useCallback(
    (board: (number | null)[][]): { winner: number | null; cells: { row: number; col: number }[] | null } => {
      // Check horizontal
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
          const cell = board[row][col]
          if (
            cell !== null &&
            cell === board[row][col + 1] &&
            cell === board[row][col + 2] &&
            cell === board[row][col + 3]
          ) {
            return {
              winner: cell,
              cells: [
                { row, col },
                { row, col: col + 1 },
                { row, col: col + 2 },
                { row, col: col + 3 },
              ],
            }
          }
        }
      }

      // Check vertical
      for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 3; row++) {
          const cell = board[row][col]
          if (
            cell !== null &&
            cell === board[row + 1][col] &&
            cell === board[row + 2][col] &&
            cell === board[row + 3][col]
          ) {
            return {
              winner: cell,
              cells: [
                { row, col },
                { row: row + 1, col },
                { row: row + 2, col },
                { row: row + 3, col },
              ],
            }
          }
        }
      }

      // Check diagonal (top-left to bottom-right)
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const cell = board[row][col]
          if (
            cell !== null &&
            cell === board[row + 1][col + 1] &&
            cell === board[row + 2][col + 2] &&
            cell === board[row + 3][col + 3]
          ) {
            return {
              winner: cell,
              cells: [
                { row, col },
                { row: row + 1, col: col + 1 },
                { row: row + 2, col: col + 2 },
                { row: row + 3, col: col + 3 },
              ],
            }
          }
        }
      }

      // Check diagonal (top-right to bottom-left)
      for (let row = 0; row < 3; row++) {
        for (let col = 6; col > 2; col--) {
          const cell = board[row][col]
          if (
            cell !== null &&
            cell === board[row + 1][col - 1] &&
            cell === board[row + 2][col - 2] &&
            cell === board[row + 3][col - 3]
          ) {
            return {
              winner: cell,
              cells: [
                { row, col },
                { row: row + 1, col: col - 1 },
                { row: row + 2, col: col - 2 },
                { row: row + 3, col: col - 3 },
              ],
            }
          }
        }
      }

      return { winner: null, cells: null }
    },
    [],
  )

  const checkDraw = useCallback((board: (number | null)[][]): boolean => {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] === null) {
          return false
        }
      }
    }
    return true
  }, [])

  // Game functions
  const startGame = useCallback(() => {
    if (!playerNames[0].trim() || !playerNames[1].trim()) {
      setError("Enter names for both players.")
      return
    }
    if (playerNames[0].trim() === playerNames[1].trim()) {
      setError("Player names cannot be the same.")
      return
    }
    if (playerColors[0] === playerColors[1]) {
      setError("Players cannot choose the same color.")
      return
    }

    setError("")
    setGameState({
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
      currentPlayer: 0,
      players: [
        { id: 0, name: playerNames[0], color: playerColors[0], wins: 0 },
        { id: 1, name: playerNames[1], color: playerColors[1], wins: 0 },
      ],
      winner: null,
      isDraw: false,
      winningCells: null,
    })
    setGameStarted(true)
    setActiveTab("game")
    playClickSound()
  }, [playerNames, playerColors, playClickSound])

  const handleInputChange = useCallback(
    (index: number, value: string, type: "name" | "color") => {
      if (type === "name") {
        setPlayerNames((prev) => {
          const newNames = [...prev]
          newNames[index] = value
          return newNames
        })
      } else {
        setPlayerColors((prev) => {
          const newColors = [...prev]
          newColors[index] = value
          return newColors
        })
        playClickSound()
      }
    },
    [playClickSound],
  )

  const handleCellClick = useCallback(
    (col: number) => {
      if (isGameOver) return

      const newBoard = gameState.board.map((row) => [...row])
      let rowToPlay = -1
      for (let row = 5; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          rowToPlay = row
          break
        }
      }

      if (rowToPlay === -1) return

      playClickSound()
      setAnimateColumn(col)

      newBoard[rowToPlay][col] = gameState.currentPlayer
      playDropSound(rowToPlay)

      const { winner, cells } = checkWinner(newBoard)
      const isDraw = winner === null ? checkDraw(newBoard) : false

      setGameState((prev) => {
        const updatedPlayers = [...prev.players]
        if (winner !== null) {
          updatedPlayers[winner] = {
            ...updatedPlayers[winner],
            wins: updatedPlayers[winner].wins + 1,
          }
        }

        return {
          ...prev,
          board: newBoard,
          currentPlayer: (prev.currentPlayer + 1) % 2,
          winner,
          isDraw,
          players: updatedPlayers,
          winningCells: cells,
        }
      })

      if (winner !== null) {
        playWinSound()
      } else if (isDraw) {
        playDrawSound()
      }

      setAnimateColumn(null)
    },
    [gameState, checkWinner, checkDraw, playClickSound, playDropSound, playWinSound, playDrawSound, isGameOver],
  )

  const continuePlaying = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
      currentPlayer: 0,
      winner: null,
      isDraw: false,
      winningCells: null,
    }))
    playClickSound()
  }, [playClickSound])

  const resetGame = useCallback(() => {
    setGameState({
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
      currentPlayer: 0,
      players: [
        { id: 0, name: "", color: "bg-red-500", wins: 0 },
        { id: 1, name: "", color: "bg-yellow-500", wins: 0 },
      ],
      winner: null,
      isDraw: false,
      winningCells: null,
    })
    setPlayerNames(["", ""])
    setPlayerColors(["bg-red-500", "bg-yellow-500"])
    setGameStarted(false)
    setActiveTab("setup")
    playClickSound()
  }, [playClickSound])

  // Get color name
  const getColorName = useCallback(
    (colorValue: string) => {
      const color = availableColors.find((c) => c.value === colorValue)
      return color ? color.name : "Unknown"
    },
    [availableColors],
  )

  // Get text color based on background color
  const getTextColor = useCallback(
    (colorValue: string) => {
      const color = availableColors.find((c) => c.value === colorValue)
      return color ? color.textColor : "text-white"
    },
    [availableColors],
  )

  // Cell size calculation based on screen size
  const cellSize = useMemo(() => {
    return isMobile ? "w-10 h-10" : "w-14 h-14 sm:w-16 sm:h-16"
  }, [isMobile])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-xl bg-gray-800 text-white border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <PlayCircle className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <motion.span initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                Connect 4
              </motion.span>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  {isSoundEnabled ? <Volume2 /> : <VolumeX />}
                </motion.div>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="How to play">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Info />
                    </motion.div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>How to Play Connect 4</DialogTitle>
                  </DialogHeader>
                  <motion.div
                    className="space-y-4 mt-4 text-sm"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div className="flex gap-3" variants={itemVariants}>
                      <div className="mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p>Players take turns dropping colored discs into the grid.</p>
                    </motion.div>
                    <motion.div className="flex gap-3" variants={itemVariants}>
                      <div className="mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p>The pieces fall straight down, occupying the lowest available space within the column.</p>
                    </motion.div>
                    <motion.div className="flex gap-3" variants={itemVariants}>
                      <div className="mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p>
                        The goal is to be the first to form a horizontal, vertical, or diagonal line of four of your own
                        discs.
                      </p>
                    </motion.div>
                    <motion.div className="flex gap-3" variants={itemVariants}>
                      <div className="mt-0.5">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <p>If the grid fills up before either player forms a line of four, the game is a draw.</p>
                    </motion.div>
                  </motion.div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="setup"
                disabled={gameStarted && gameState.winner === null && !gameState.isDraw}
                aria-label="Game Setup"
              >
                <Settings className="w-4 h-4 mr-2" />
                Setup
              </TabsTrigger>
              <TabsTrigger value="game" disabled={!gameStarted} aria-label="Game Board">
                <PlayCircle className="w-4 h-4 mr-2" />
                Game
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="m-0">
              <CardContent>
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault()
                    startGame()
                  }}
                >
                  <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
                    <motion.h3 className="text-lg font-medium" variants={itemVariants}>
                      Player 1
                    </motion.h3>
                    <motion.div className="grid gap-3" variants={itemVariants}>
                      <div>
                        <Label htmlFor="player1-name" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Name
                        </Label>
                        <Input
                          type="text"
                          id="player1-name"
                          value={playerNames[0]}
                          onChange={(e) => handleInputChange(0, e.target.value, "name")}
                          placeholder="Enter name"
                          className="w-full bg-gray-700 border-gray-600 focus:border-indigo-500"
                          required
                          aria-required="true"
                          aria-invalid={!playerNames[0].trim() ? "true" : "false"}
                          aria-describedby="player1-name-error"
                        />
                      </div>
                      <div>
                        <Label htmlFor="player1-color" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Palette className="w-4 h-4" /> Color
                        </Label>
                        <div
                          className="flex flex-wrap gap-2"
                          id="player1-color"
                          role="radiogroup"
                          aria-label="Player 1 color selection"
                        >
                          {availableColors.map((color) => (
                            <motion.button
                              type="button"
                              onClick={() => handleInputChange(0, color.value, "color")}
                              className={cn(
                                "w-9 h-9 rounded-full transition-all",
                                playerColors[0] === color.value
                                  ? "ring-2 ring-offset-2 ring-indigo-400 scale-110"
                                  : "hover:ring-2 hover:ring-offset-1 hover:ring-gray-100",
                                color.value,
                                playerColors[1] === color.value ? "opacity-40 cursor-not-allowed" : "",
                              )}
                              disabled={playerColors[1] === color.value}
                              aria-checked={playerColors[0] === color.value}
                              aria-label={color.name}
                              role="radio"
                              whileHover={{ scale: playerColors[1] === color.value ? 1 : 1.1 }}
                              whileTap={{ scale: playerColors[1] === color.value ? 1 : 0.95 }}
                            />

                          ))}
                        </div>
                        {playerColors[0] && (
                          <p className="text-xs mt-2">
                            Selected:{" "}
                            <span className={cn("font-medium", getTextColor(playerColors[0]))}>
                              {getColorName(playerColors[0])}
                            </span>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                  <Separator className="bg-gray-700" />
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delayChildren: 0.3 }}
                  >
                    <motion.h3 className="text-lg font-medium" variants={itemVariants}>
                      Player 2
                    </motion.h3>
                    <motion.div className="grid gap-3" variants={itemVariants}>
                      <div>
                        <Label htmlFor="player2-name" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Name
                        </Label>
                        <Input
                          type="text"
                          id="player2-name"
                          value={playerNames[1]}
                          onChange={(e) => handleInputChange(1, e.target.value, "name")}
                          placeholder="Enter name"
                          className="w-full bg-gray-700 border-gray-600 focus:border-indigo-500"
                          required
                          aria-required="true"
                          aria-invalid={!playerNames[1].trim() ? "true" : "false"}
                          aria-describedby="player2-name-error"
                        />
                      </div>
                      <div>
                        <Label htmlFor="player2-color" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                          <Palette className="w-4 h-4" /> Color
                        </Label>
                        <div
                          className="flex flex-wrap gap-2"
                          id="player2-color"
                          role="radiogroup"
                          aria-label="Player 2 color selection"
                        >
                          {availableColors.map((color) => (
                            <motion.button
                              type="button"
                              onClick={() => handleInputChange(1, color.value, "color")}
                              className={cn(
                                "w-9 h-9 rounded-full transition-all",
                                playerColors[1] === color.value
                                  ? "ring-2 ring-offset-2 ring-indigo-400 scale-110"
                                  : "hover:ring-2 hover:ring-offset-1 hover:ring-white-500",
                                color.value,
                                playerColors[0] === color.value ? "opacity-40 cursor-not-allowed" : "",
                              )}
                              disabled={playerColors[0] === color.value}
                              aria-checked={playerColors[1] === color.value}
                              aria-label={color.name}
                              role="radio"
                              whileHover={{ scale: playerColors[0] === color.value ? 1 : 1.1 }}
                              whileTap={{ scale: playerColors[0] === color.value ? 1 : 0.95 }}
                            />

                          ))}
                        </div>
                        {playerColors[1] && (
                          <p className="text-xs mt-2">
                            Selected:{" "}
                            <span className={cn("font-medium", getTextColor(playerColors[1]))}>
                              {getColorName(playerColors[1])}
                            </span>
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-start gap-2"
                      role="alert"
                      aria-live="assertive"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  <motion.div
                    className="pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200 flex items-center justify-center gap-2 h-11"
                    >
                      <PlayCircle className="w-5 h-5" /> Start Game
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </TabsContent>
            <TabsContent value="game" className="m-0">
              <CardContent className="pb-0">
                <motion.div
                  className="flex justify-between items-center mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge variant="outline" className="px-3 py-1 text-sm rounded-full bg-gray-700 border-gray-600">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>Game Score</span>
                  </Badge>
                  <div className="flex gap-2 sm:gap-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        playerColors[0],
                        getTextColor(playerColors[0]),
                      )}
                    >
                      {gameState.players[0].name}: {gameState.players[0].wins}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        playerColors[1],
                        getTextColor(playerColors[1]),
                      )}
                    >
                      {gameState.players[1].name}: {gameState.players[1].wins}
                    </Badge>
                  </div>
                </motion.div>
                {/* Current Player Indicator */}
                <div className="mx-auto mb-6 max-w-md">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={gameState.currentPlayer + (isGameOver ? "-game-over" : "")}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-lg",
                        gameState.winner === null && !gameState.isDraw
                          ? cn(
                            "border-2",
                            gameState.players[gameState.currentPlayer].color,
                            getTextColor(gameState.players[gameState.currentPlayer].color),
                          )
                          : "bg-transparent",
                      )}
                    >
                      {gameState.winner === null && !gameState.isDraw ? (
                        <>
                          <motion.div
                            className={cn("w-5 h-5 rounded-full", gameState.players[gameState.currentPlayer].color)}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2 }}
                          />
                          <p className="font-medium">{gameState.players[gameState.currentPlayer].name}'s Turn</p>
                        </>
                      ) : gameState.winner !== null ? (
                        <>
                          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: 2, duration: 0.5 }}>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          </motion.div>
                          <p className="font-bold">{gameState.players[gameState.winner].name} Wins!</p>
                        </>
                      ) : (
                        <p className="font-bold text-gray-500">It's a Draw!</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Game Board */}
                <motion.div
                  className="relative flex justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <div
                    className={cn("grid gap-2 sm:gap-3", isMobile ? "grid-cols-7 max-w-md" : "grid-cols-7 max-w-xl")}
                    role="grid"
                    aria-label="Connect 4 game board"
                  >
                    {gameState.board[0].map((_, col) => (
                      <Column
                        key={col}
                        col={col}
                        board={gameState.board}
                        cellSize={cellSize}
                        players={gameState.players}
                        winningCells={gameState.winningCells}
                        handleCellClick={handleCellClick}
                        isGameOver={isGameOver}
                        animateColumn={animateColumn}
                      />
                    ))}
                  </div>
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-center p-6">
                {isGameOver ? (
                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={continuePlaying}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-5 rounded-lg transition-colors duration-200"
                    >
                      Play Again
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="flex-1 border-gray-600 hover:bg-gray-700 font-medium py-5 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <RotateCw className="w-4 h-4" /> New Game
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700 font-medium py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" /> Return to Setup
                    </Button>
                  </motion.div>
                )}
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Connect4Game;