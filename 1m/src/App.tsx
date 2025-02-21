import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Define the structure of a journal entry
interface JournalEntry {
	timestamp: number;
	title: string;
	content: string;
}

function App() {
	// useState hook to manage the list of journal entries.
	const [entries, setEntries] = useState<JournalEntry[]>(() => {
		const storedEntries = localStorage.getItem("journalEntries");
		if (storedEntries) {
			try {
				return JSON.parse(storedEntries) as JournalEntry[];
			} catch (error) {
				console.error(
					"Error parsing journal entries from localStorage:",
					error
				);
				return [];
			}
		}
		return [];
	});

	// useState hooks to manage form input values, editing state, delete confirmation, dialog visibility and sorting order.
	const [title, setTitle] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
	const [openDialogs, setOpenDialogs] = useState<{ [key: number]: boolean }>(
		{}
	);
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

	// useEffect hook to save journal entries to local storage whenever the 'entries' state changes
	useEffect(() => {
		localStorage.setItem("journalEntries", JSON.stringify(entries));
	}, [entries]);

	// useEffect hook to sort the journal entries based on the selected sort order
	useEffect(() => {
		let sortedEntries = [...entries];
		if (sortOrder === "newest") {
			sortedEntries.sort((a, b) => b.timestamp - a.timestamp);
		} else {
			sortedEntries.sort((a, b) => a.timestamp - b.timestamp);
		}

		const areEqual =
			entries.length === sortedEntries.length &&
			entries.every(
				(obj, index) => obj.timestamp === sortedEntries[index].timestamp
			);

		if (!areEqual) {
			setEntries(sortedEntries);
		}
	}, [sortOrder, entries]);

	// Handles form submission to create or update a journal entry.
	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (!title.trim() || !content.trim()) {
			alert("Title and content cannot be empty.");
			return;
		}

		if (editingIndex !== null) {
			const updatedEntries = [...entries];
			updatedEntries[editingIndex] = {
				...updatedEntries[editingIndex],
				title,
				content,
			};
			setEntries(updatedEntries);
			setEditingIndex(null);
		} else {
			const newEntry: JournalEntry = {
				timestamp: Date.now(),
				title,
				content,
			};
			setEntries([...entries, newEntry]);
		}

		setTitle("");
		setContent("");
	};

	// Sets the state for editing an existing journal entry.
	const handleEdit = (index: number) => {
		setTitle(entries[index].title);
		setContent(entries[index].content);
		setEditingIndex(index);
	};

	// Sets the state for deleting a journal entry and opens the confirmation dialog.
	const handleDelete = (index: number) => {
		setDeleteIndex(index);
		setOpenDialogs((prev) => ({ ...prev, [index]: true }));
	};

	// Confirms the deletion of a journal entry.
	const confirmDelete = () => {
		if (deleteIndex !== null) {
			const newEntries = [...entries];
			newEntries.splice(deleteIndex, 1);
			setEntries(newEntries);
			setOpenDialogs((prev) => {
				const { [deleteIndex]: deleted, ...rest } = prev;
				return rest;
			});
			setDeleteIndex(null);
		}
	};

	// Cancels the deletion of a journal entry and closes the confirmation dialog.
	const handleCancelDelete = () => {
		setOpenDialogs((prev) => {
			const { [deleteIndex]: deleted, ...rest } = prev;
			return rest;
		});
		setDeleteIndex(null);
	};

	// Cancels the editing of a journal entry and resets the form.
	const handleCancelEdit = () => {
		setTitle("");
		setContent("");
		setEditingIndex(null);
	};

	// Renders the main application UI
	return (
		<motion.div
			className="font-inter bg-zinc-50 h-screen flex flex-col items-center py-10 w-full rounded-lg lg:overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0, transition: { duration: 0.5 } }}>
			<motion.h1
				className="text-5xl font-extrabold text-center text-indigo-700 mb-8 rounded-lg py-2 px-4"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}>
				My Journal
			</motion.h1>

			<div className="flex flex-col md:flex-row max-w-[90%] w-full h-[90%] gap-8">
				{/* Form for creating or editing journal entries */}
				<motion.form
					id="new-entry"
					onSubmit={handleSubmit}
					className="w-full bg-white p-8 rounded-xl shadow-lg flex flex-col"
					aria-label="New Journal Entry Form"
					initial={{ x: -200, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}>
					<h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
						New Entry
					</h2>
					<input
						type="text"
						id="entry-title"
						placeholder="Title"
						className="w-full px-5 py-3 border border-gray-300 rounded-md mb-5 focus:outline-none focus:border-indigo-500 bg-white text-gray-700"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						aria-label="Entry Title"
						aria-required="true"
					/>
					<textarea
						id="entry-content"
						placeholder="Write your thoughts..."
						className="w-full px-5 py-3 border border-gray-300 rounded-md mb-5 focus:outline-none focus:border-indigo-500 h-40 resize-none bg-white text-gray-700 flex-grow overflow-y-auto"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						aria-label="Entry Content"
						aria-required="true"></textarea>
					<div className="flex justify-between gap-2 mt-auto">
						<button
							id="save-button"
							type="submit"
							className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition duration-300 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
							aria-label="Save Entry">
							{editingIndex !== null
								? "Save Entry"
								: "Create Entry"}
						</button>
						{editingIndex !== null && (
							<button
								type="button"
								className="w-1/2 bg-gray-400 text-white py-3 rounded-md hover:bg-gray-500 transition duration-300 font-semibold focus:ring-2 focus:ring-gray-500 outline-none"
								onClick={handleCancelEdit}
								aria-label="Cancel Edit">
								Cancel
							</button>
						)}
					</div>
				</motion.form>

				{/* Display of existing journal entries */}
				<motion.div
					id="entry-list"
					className="flex flex-col w-full rounded-lg gap-10 h-full"
					initial={{ x: 200, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}>
					<div className="flex justify-center">
						<Select
							value={sortOrder}
							onValueChange={setSortOrder}
							className="mt-6 mb-8">
							<SelectTrigger
								className="w-[180px] shadow-sm bg-white text-gray-700 border border-gray-300 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
								aria-label="Sort by">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent className="bg-white text-gray-700 shadow-md">
								<SelectItem
									value="newest"
									className="cursor-pointer focus:bg-gray-100">
									Newest to Oldest
								</SelectItem>
								<SelectItem
									value="oldest"
									className="cursor-pointer focus:bg-gray-100">
									Oldest to Newest
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<h2 className="text-3xl font-semibold text-gray-800 text-center flex-shrink-0">
						Journal Entries
					</h2>
					<div className="flex flex-col md:h-max-80 lg:h-max-80 md:overflow-y-auto lg:overflow-y-auto">
						<ul className="flex flex-col w-full h-full pr-4 gap-4 pb-6 box-border">
							{entries.map((entry, index) => (
								<motion.li
									key={index}
									className="bg-white p-6 gap-4 rounded-xl shadow-md flex flex-row justify-between items-center border border-gray-200"
									initial={{ opacity: 0, y: 50 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										delay: index * 0.1,
									}}>
									<div className="flex flex-col rounded-lg">
										<h3 className="text-lg font-semibold text-indigo-700">
											{new Date(
												entry.timestamp
											).toLocaleDateString()}{" "}
											- {entry.title}
										</h3>
										<div
											className="text-gray-700 mt-2"
											style={{ whiteSpace: "pre-wrap" }}>
											{entry.content}
										</div>
									</div>
									<div className="flex space-x-3 h-fit">
										<button
											className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
											type="button"
											onClick={() => handleEdit(index)}
											aria-label={`Edit entry ${
												index + 1
											}`}>
											Edit
										</button>
										<Dialog
											key={`dialog-${index}`}
											open={openDialogs[index] || false}
											onOpenChange={(isOpen) =>
												setOpenDialogs((prev) => ({
													...prev,
													[index]: isOpen,
												}))
											}>
											<DialogTrigger asChild>
												<button
													className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
													type="button"
													onClick={() =>
														handleDelete(index)
													}
													aria-label={`Delete entry ${
														index + 1
													}`}>
													Delete
												</button>
											</DialogTrigger>
											<DialogContent className="sm:max-w-[425px] rounded-xl bg-white shadow-lg">
												<DialogHeader className="rounded-lg">
													<DialogTitle className="text-lg font-semibold text-gray-800">
														Are you absolutely sure?
													</DialogTitle>
													<DialogDescription className="text-gray-700">
														This action cannot be
														undone. Are you sure you
														want to permanently
														delete this entry?
													</DialogDescription>
												</DialogHeader>
												<DialogFooter className="rounded-lg">
													<Button
														type="button"
														variant="secondary"
														onClick={
															handleCancelDelete
														}
														className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-4 py-2 font-semibold"
														aria-label="Cancel delete">
														Cancel
													</Button>
													<Button
														type="button"
														variant="destructive"
														onClick={confirmDelete}
														className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 font-semibold"
														aria-label="Confirm delete">
														Confirm Delete
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</motion.li>
							))}
						</ul>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

export default App;
