const prizeElement = document.getElementById("prize");
const timerElement = document.getElementById("timer");
const entryForm = document.getElementById("entry-form");
const nameInput = document.getElementById("name");
const submitButton = document.querySelector("#entry-form button");
const entriesElement = document.getElementById("entries");
const winnerElement = document.getElementById("winner");

prizeElement.textContent = "Amazing Prize";
const endTime = Date.now() + 1000 * 10 * 1;

let timerInterval = setInterval(() => {
	const timeRemaining = endTime - Date.now();
	const minutes = Math.floor(timeRemaining / 1000 / 60);
	const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
	timerElement.textContent = `${minutes}:${seconds
		.toString()
		.padStart(2, "0")}`;

	if (timeRemaining <= 0) {
		clearInterval(timerInterval);
		timerElement.textContent = "00:00";
		nameInput.disabled = true;
		submitButton.disabled = true;
		pickWinner();
	}
}, 1000);

const entries = [];

entryForm.addEventListener("submit", (event) => {
	entriesElement.hidden=false;
	event.preventDefault();
	const name = document.getElementById("name").value;
	const entry = document.createElement("p");
	entry.textContent = `${name}`;

	if(!entries.includes(name)){
		entriesElement.appendChild(entry);
		entries.push(name);
		document.getElementById("name").value = "";
		triggerToast(`Thank you ${name}, for entering the raffle!`);
	}else{
		triggerToast(`You can only enter your name once!`);
	}
	
});

function pickWinner() {
	if (entries.length > 0) {
		const randomIndex = Math.floor(Math.random() * entries.length);
		const winner = entries[randomIndex];
		winnerElement.innerHTML = `<div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Congratulations ${winner}!</h4>
        <p>You're the winner</p>
        </div>`;
	} else {
		winnerElement.innerHTML = `<div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Oops!</h4>
        <p>Looks like no one participated</p>
        </div>`;
	}
}

function triggerToast(message) {
	const toastLiveExample = document.getElementById('liveToast');
	const toastBody = document.getElementById('messageText')
	toastBody.innerHTML=message;

	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
	toastBootstrap.show()
}