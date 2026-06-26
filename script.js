const canvas = document.getElementById('canvas');
const addBoxBtn = document.getElementById('addBoxBtn');
const clearBtn = document.getElementById('clearBtn');
const dateInput = document.getElementById('dateInput');
const editorPanel = document.getElementById('editorPanel');
const colorButtons = Array.from(document.querySelectorAll('.color-option'));
const valueA = document.getElementById('valueA');
const valueB = document.getElementById('valueB');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const closeBtn = document.getElementById('closeBtn');

const DEFAULT_STATE = {
  date: '24.06',
  blocks: [],
  board: {
    left: Array(14).fill(null).map(() => ({ color: '#38bdf8', valueA: 0, valueB: 0 })),
    rightTop: Array(8).fill(null).map(() => ({ color: '#22c55e', valueA: 0, valueB: 0 })),
    rightBottom: Array(6).fill(null).map(() => ({ color: '#fbbf24', valueA: 0, valueB: 0 })),
    bottomCenter: Array(12).fill(null).map(() => ({ color: '#fbbf24', valueA: 0, valueB: 0 })),
  }
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let selectedColor = '#38bdf8';
let editingType = null;
let editingIndex = null;
let editingBoxId = null;
let draggingElement = null;
let dragOffset = { x: 0, y: 0 };
let dragStartPos = { x: 0, y: 0 };
let isDragging = false;


function loadState() {
  const saved = localStorage.getItem('board-state');
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }
  dateInput.value = state.date;
  updateDateDisplay();
}

function updateDateDisplay() {
  const dateDisplay = document.getElementById('dateDisplay');
  if (dateDisplay) {
    dateDisplay.textContent = state.date;
  }
}

function saveState() {
  state.date = dateInput.value;
  updateDateDisplay();
  localStorage.setItem('board-state', JSON.stringify(state));
}

function clearAllState() {
  if (confirm('Вы уверены? Это вернёт всё в исходный вариант.')) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    renderBoard();
    renderBoxes();
  }
}

function renderBoard() {
  const leftGrid = document.getElementById('leftGrid');
  const rightTopGrid = document.getElementById('rightTopGrid');
  const rightBottomGrid = document.getElementById('rightBottomGrid');
  const bottomCenterGrid = document.getElementById('bottomCenterGrid');

  leftGrid.innerHTML = '';
  rightTopGrid.innerHTML = '';
  rightBottomGrid.innerHTML = '';
  bottomCenterGrid.innerHTML = '';

  state.board.left.forEach((block, idx) => {
    const el = createBlockElement(block, 'left', idx);
    leftGrid.appendChild(el);
  });

  state.board.rightTop.forEach((block, idx) => {
    const el = createBlockElement(block, 'rightTop', idx);
    rightTopGrid.appendChild(el);
  });

  state.board.rightBottom.forEach((block, idx) => {
    const el = createBlockElement(block, 'rightBottom', idx);
    rightBottomGrid.appendChild(el);
  });

  state.board.bottomCenter.forEach((block, idx) => {
    const el = createBlockElement(block, 'bottomCenter', idx);
    bottomCenterGrid.appendChild(el);
  });
}

function createBlockElement(block, type, index) {
  const el = document.createElement('div');
  el.className = 'board-block';
  el.style.background = block.color;
  el.innerHTML = `<span>${block.valueA}</span><span>${block.valueB}</span>`;
  el.dataset.type = type;
  el.dataset.index = index;
  
  el.addEventListener('touchstart', handleBlockDragStart);
  el.addEventListener('touchmove', handleBlockDragMove);
  el.addEventListener('touchend', handleBlockDragEnd);
  el.addEventListener('click', (e) => {
    openBlockEditor(type, index, block);
  });
  
  return el;
}

function openBlockEditor(type, index, block) {
  editingType = type;
  editingIndex = index;
  editingBoxId = null;
  selectedColor = block.color;
  valueA.value = block.valueA;
  valueB.value = block.valueB;
  colorButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.color === block.color);
  });
  editorPanel.classList.remove('hidden');
}

function closeEditor() {
  editingType = null;
  editingIndex = null;
  editingBoxId = null;
  editorPanel.classList.add('hidden');
}

function updateBlock() {
  if (editingType === 'block') {
    const block = state.blocks.find((b) => b.id === editingBoxId);
    if (block) {
      block.color = selectedColor;
      block.valueA = Number(valueA.value) || 0;
      block.valueB = Number(valueB.value) || 0;
    }
  } else if (editingType && editingIndex !== null) {
    state.board[editingType][editingIndex] = {
      color: selectedColor,
      valueA: Number(valueA.value) || 0,
      valueB: Number(valueB.value) || 0,
    };
  }

  saveState();
  renderBoard();
  renderBoxes();
  closeEditor();
}

function deleteBlock() {
  if (editingType === 'block') {
    state.blocks = state.blocks.filter((b) => b.id !== editingBoxId);
  } else if (editingType && editingIndex !== null) {
    state.board[editingType][editingIndex] = {
      color: '#38bdf8',
      valueA: 0,
      valueB: 0,
    };
  }

  saveState();
  renderBoard();
  renderBoxes();
  closeEditor();
}

function renderBoxes() {
  canvas.innerHTML = '';
  state.blocks.forEach((block) => {
    const element = document.createElement('div');
    element.className = 'board-block';
    element.dataset.id = block.id;
    element.style.background = block.color;
    element.style.position = 'absolute';
    element.style.left = block.x + 'px';
    element.style.top = block.y + 'px';
    element.innerHTML = `<span>${block.valueA}</span><span>${block.valueB}</span>`;
    
    element.addEventListener('touchstart', handleBlockDragStart);
    element.addEventListener('touchmove', handleBlockDragMove);
    element.addEventListener('touchend', handleBlockDragEnd);
    element.addEventListener('click', (e) => {
      editingBoxId = block.id;
      editingType = 'block';
      openBlockEditor('block', null, block);
    });
    
    canvas.appendChild(element);
  });
}

function createBox() {
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  state.blocks.push({
    id,
    color: selectedColor,
    valueA: 0,
    valueB: 0,
    x: 20,
    y: 20,
  });
  saveState();
  renderBoxes();
}

function selectColorFunc(color) {
  selectedColor = color;
  colorButtons.forEach((button) => {
    button.classList.toggle('selected', button.dataset.color === color);
  });
}

function handleBlockDragStart(e) {
  const touch = e.touches[0];
  if (!touch) return;
  
  isDragging = false;
  draggingElement = this;
  const rect = this.getBoundingClientRect();
  
  dragOffset.x = touch.clientX - rect.left;
  dragOffset.y = touch.clientY - rect.top;
  dragStartPos.x = touch.clientX;
  dragStartPos.y = touch.clientY;
  
  e.preventDefault();
}

function handleBlockDragMove(e) {
  if (!draggingElement) return;
  
  const touch = e.touches[0];
  if (!touch) return;
  
  const distance = Math.sqrt(
    Math.pow(touch.clientX - dragStartPos.x, 2) + 
    Math.pow(touch.clientY - dragStartPos.y, 2)
  );
  
  if (distance > 5) {
    isDragging = true;
  }
  
  if (!isDragging) return;
  
  if (!draggingElement.classList.contains('dragging')) {
    const rect = draggingElement.getBoundingClientRect();
    draggingElement.classList.add('dragging');
    draggingElement.style.position = 'fixed';
    draggingElement.style.left = rect.left + 'px';
    draggingElement.style.top = rect.top + 'px';
    draggingElement.style.width = rect.width + 'px';
    draggingElement.style.height = rect.height + 'px';
  }
  
  draggingElement.style.left = (touch.clientX - dragOffset.x) + 'px';
  draggingElement.style.top = (touch.clientY - dragOffset.y) + 'px';
  
  e.preventDefault();
}

function handleBlockDragEnd(e) {
  if (!draggingElement) return;
  
  // Если это был просто клик (без перемещения)
  if (!isDragging) {
    const id = draggingElement.dataset.id;
    const type = draggingElement.dataset.type;
    const block = state.blocks.find((b) => b.id === id);
    
    if (block) {
      editingBoxId = id;
      editingType = 'block';
      openBlockEditor('block', null, block);
    }
    
    draggingElement = null;
    isDragging = false;
    e.preventDefault();
    return;
  }
  
  // Если это было перемещение
  const canvasRect = canvas.getBoundingClientRect();
  const elementRect = draggingElement.getBoundingClientRect();
  
  let x = elementRect.left - canvasRect.left;
  let y = elementRect.top - canvasRect.top;
  
  x = Math.max(0, Math.min(x, canvasRect.width - elementRect.width));
  y = Math.max(0, Math.min(y, canvasRect.height - elementRect.height));
  
  const id = draggingElement.dataset.id;
  const block = state.blocks.find((b) => b.id === id);
  
  if (block) {
    block.x = x;
    block.y = y;
    saveState();
  }
  
  draggingElement.classList.remove('dragging');
  draggingElement.style.position = 'absolute';
  draggingElement = null;
  isDragging = false;
  
  e.preventDefault();
}

function handleBoxDragStart(e) {
  const touch = e.touches[0];
  if (!touch) return;
  
  isDragging = false;
  draggingElement = this;
  const rect = this.getBoundingClientRect();
  
  dragOffset.x = touch.clientX - rect.left;
  dragOffset.y = touch.clientY - rect.top;
  dragStartPos.x = touch.clientX;
  dragStartPos.y = touch.clientY;
  
  e.preventDefault();
}

function handleBoxDragMove(e) {
  if (!draggingElement) return;
  
  const touch = e.touches[0];
  if (!touch) return;
  
  const distance = Math.sqrt(
    Math.pow(touch.clientX - dragStartPos.x, 2) + 
    Math.pow(touch.clientY - dragStartPos.y, 2)
  );
  
  if (distance > 5) {
    isDragging = true;
  }
  
  if (!isDragging) return;
  
  if (!draggingElement.classList.contains('dragging')) {
    const rect = draggingElement.getBoundingClientRect();
    draggingElement.classList.add('dragging');
    draggingElement.style.position = 'fixed';
    draggingElement.style.left = rect.left + 'px';
    draggingElement.style.top = rect.top + 'px';
    draggingElement.style.width = rect.width + 'px';
    draggingElement.style.height = rect.height + 'px';
  }
  
  draggingElement.style.left = (touch.clientX - dragOffset.x) + 'px';
  draggingElement.style.top = (touch.clientY - dragOffset.y) + 'px';
  
  e.preventDefault();
}

function handleBoxDragEnd(e) {
  if (!draggingElement) return;
  
  // Если это был просто клик (без перемещения)
  if (!isDragging) {
    const id = draggingElement.dataset.id;
    const block = state.blocks.find((b) => b.id === id);
    
    if (block) {
      editingBoxId = id;
      editingType = 'block';
      openBlockEditor('block', null, block);
    }
    
    draggingElement = null;
    isDragging = false;
    e.preventDefault();
    return;
  }
  
  // Если это было перемещение
  const canvasRect = canvas.getBoundingClientRect();
  const elementRect = draggingElement.getBoundingClientRect();
  
  let x = elementRect.left - canvasRect.left;
  let y = elementRect.top - canvasRect.top;
  
  x = Math.max(0, Math.min(x, canvasRect.width - elementRect.width));
  y = Math.max(0, Math.min(y, canvasRect.height - elementRect.height));
  
  const id = draggingElement.dataset.id;
  const block = state.blocks.find((b) => b.id === id);
  
  if (block) {
    block.x = x;
    block.y = y;
    saveState();
  }
  
  draggingElement.classList.remove('dragging');
  draggingElement.style.position = 'absolute';
  draggingElement = null;
  isDragging = false;
  
  e.preventDefault();
}

addBoxBtn.addEventListener('click', createBox);
clearBtn.addEventListener('click', clearAllState);
dateInput.addEventListener('input', saveState);
saveBtn.addEventListener('click', updateBlock);
deleteBtn.addEventListener('click', deleteBlock);
closeBtn.addEventListener('click', closeEditor);
colorButtons.forEach((button) => {
  button.addEventListener('click', () => selectColorFunc(button.dataset.color));
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeEditor();
  }
});

selectColorFunc(selectedColor);
loadState();
renderBoard();
renderBoxes();
