const notesContainer = document.getElementById('notes-container');
const noteInput = document.getElementById('note-input');
const addNoteButton = document.getElementById('add-note');
const socket = new WebSocket('ws://localhost:3000');

let drawing = false;

addNoteButton.addEventListener('click', () => {
    const noteText = noteInput.value;
    if (noteText) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.textContent = noteText;
        noteDiv.style.left = `${Math.random() * (window.innerWidth - 200)}px`;
        noteDiv.style.top = `${Math.random() * (window.innerHeight - 200)}px`;
        notesContainer.appendChild(noteDiv);
        noteInput.value = '';
        makeDraggable(noteDiv);
    }
});

document.addEventListener('mousedown', (event) => {
    drawing = true;
    draw(event.clientX, event.clientY);
});

document.addEventListener('mouseup', () => {
    drawing = false;
});

document.addEventListener('mousemove', (event) => {
    if (drawing) {
        draw(event.clientX, event.clientY);
    }
    socket.send(JSON.stringify({ type: 'cursor', x: event.clientX, y: event.clientY }));
});

function draw(x, y) {
    const dot = document.createElement('div');
    dot.className = 'cursor';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 1000);
}

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'cursor') {
        const cursor = document.createElement('div');
        cursor.className = 'cursor';
        cursor.style.left = `${data.x}px`;
        cursor.style.top = `${data.y}px`;
        document.body.appendChild(cursor);
        setTimeout(() => cursor.remove(), 1000);
    }
};

function makeDraggable(note) {
    note.onmousedown = function(event) {
        let shiftX = event.clientX - note.getBoundingClientRect().left;
        let shiftY = event.clientY - note.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            note.style.left = pageX - shiftX + 'px';
            note.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        note.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            note.onmouseup = null;
        };
    };

    note.ondragstart = function() {
        return false;
    };
}