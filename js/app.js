import AppCard from '/js/components/card/card.js';
import { openDB } from '/node_modules/idb/build/esm/index.js';
import checkConnectivity from '/js/connection.js';

(async function(document) {
  const app = document.querySelector('#app');
  //const skeleton = app.querySelector('.skeleton');
  //const listPage = app.querySelector('[page=list]');
  //skeleton.removeAttribute('active');
  //listPage.setAttribute('active', '');
  

  checkConnectivity();
  document.addEventListener('connection-changed', ({ detail }) => {
    console.log(detail);
  });

  try {
    const data = await fetch('db.json');
    const json = await data.json();
    
    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('articles');
      }
    });
  
    const todoListDOM = document.getElementById('todoList');
    const todoAddDOM = document.getElementById('add');
    const todoInputDOM = document.getElementById('field');
    //const todoDeleteDOM = document.getElementById('delete');
    
    let todoList = [];

    fetch('http://localhost:3000/todolist')
    .then(res => res.json())
    .then(json => {
        todoList = todoList.concat(json);
        render(todoList);
    })
    .catch(err => {
        console.log(err);
    })


    /**
     * 
     * AFFICHE LA TODOLIST 
     */

function renderTodoList (todoList) {
  const html = todoList.map((item, index) => `<li class="list">
          <p class="desc">
              ${item.task}
          </p>
          <button data-id=${item.id}>Delete</button>
      </li>`).join('')
  todoListDOM.innerHTML = html;
}

/**
 * 
 * AJOUTE DANS LE JSON
 */

const addItem = item => {
  fetch('http://localhost:3000/todolist', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
  })
  .then(res => res.json())
  .then(json => {
      todoList.push(json);
      render(todoList);
  })
}

/**
 * 
 * CREE DANS LE JSON LA TODOLIST 
 */

const newItem = value => ({ task: todoInputDOM.value});

todoAddDOM.addEventListener('click', event => {
  console.log(todoInputDOM.value);
    addItem(newItem(event.target.value));
    event.target.value = '';
});

/**
 * 
 * EFFACE DANS LE JSON 
 */

const removeItem = id => {
  fetch(`http://localhost:3000/todolist/${id}`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(res => res.json())
  .then(json => {
      todoList = todoList.filter(item => item.id !== id);
      render(todoList);
  })
}

/**
 * Delete sur le listener
 */

todoListDOM.addEventListener('click', event => {
  const currentTarget = event.target;
      removeItem(parseInt(currentTarget.dataset.id, 10))
});


/**
 *  APPELLE LA FONCTION POUR AFFICHER LA TODOLIST
 */

function render (todoList) {
  renderTodoList(todoList);
}

    if (navigator.onLine) {
      await database.put('articles', json, 'articles');
    }

    const acticles = await database.get('articles', 'articles');
  
    const cards = acticles.map(item => {
      const cardElement = new AppCard();
      
      cardElement.initCard(item.image,
        item.placeholder,
        item.content.title,
        item.content.description);
      listPage.appendChild(cardElement);
  
      if (!'IntersectionObserver' in window) {
        cardElement.swapImage();
      }

      return cardElement;
    });
  
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
     */
    const options = {
      rootMarging : '0px 0px 0px 0px'
    };
    const callback = entries => {
      entries.forEach((entry) => {
        // If image element in view
        if (entry.isIntersecting) {
          // Actualy load image
          const card = entry.target
          card.swapImage();
        }
      });
    };
  
    const io = new IntersectionObserver(callback, options);
    // Observe cards as they enter the viewport
    cards.forEach(card => {
      io.observe(card);
    }); 
  } catch(error) {
    console.error(error);
  }
})(document);
