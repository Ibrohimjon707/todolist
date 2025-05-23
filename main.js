let searchInput = document.querySelector("#searchInput");
let sortSelect = document.querySelector("#sortSelect");
let ul = document.querySelector("ul");
let moon = document.querySelector("#moon");
let sun = document.querySelector(".sun");
let buttonSend = document.querySelector(".send-button");
let input = document.querySelector(".input-text");
let wrapper = document.querySelector(".wrapper");
let editing = null;                                     

function updateLineColor(el) {
  el.style.color = document.body.classList.contains("dark-mode")
    ? "white"
    : "#25252580";
}

moon.addEventListener("click", () => {
  document.body.classList.add("dark-mode");
  moon.style.display = "none";
  sun.style.display = "block";
});

sun.addEventListener("click", () => {
  document.body.classList.remove("dark-mode");
  sun.style.display = "none";
  moon.style.display = "block";
});

buttonSend.addEventListener("click", (e) => {
  e.preventDefault();
  addOrEditItem();
});

async function addOrEditItem() {
  if (input.value.trim() === "") {
    alert("Iltimos, inputga nimadir kiriting");
    return;
  }

  if (editing) {
    editing.querySelector("p").textContent = input.value;
    editing = null;
  } else {
    let li = document.createElement("li");
    let p = document.createElement("p");
    let div = document.createElement("div");

    div.classList.add("item");
    div.innerHTML = `<i class="fas fa-pen pen"></i> <i class="fas fa-trash trash"></i>`;

    p.textContent = input.value;
    li.append(p, div);
    ul.prepend(li);

    li.querySelector(".trash").addEventListener("click", () => li.remove());
    li.querySelector(".pen").addEventListener("click", (e) => {
      e.stopPropagation();
      input.value = p.textContent;
      input.focus();
      editing = li;
    });

    p.addEventListener("click", (e) => {
      e.stopPropagation();
      p.classList.toggle("line-through");
      updateLineColor(p);
    });

    try {
      await fetch("https://6825adbb0f0188d7e72df09a.mockapi.io/users/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: input.value }),
      });
    } catch (err) {
      alert("Xatolik: APIga yuborib bo‘lmadi");
    }
  }

  input.value = "";
  render();
  sortFunction()
}

async function render() {
  try {
    let response = await fetch(
      "https://6825adbb0f0188d7e72df09a.mockapi.io/users/users"
    );
    let data = await response.json();

    wrapper.innerHTML = "";

    data.forEach((user, index) => {
      let div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <p class="firstName"><strong>Ism:</strong> ${user.firstName}</p>
        <button onclick="updateCard('${user.id}', ${index})">Update</button>
         <button onclick="deleteFunct('${user.id}', ${index})">Delete</button>
      `;
      wrapper.appendChild(div);
    });
  } catch (error) {
    console.error("Ma'lumotni olishda xatolik:", error);
  }
}
render();
sortFunction() 
function deleteFunct(id, index) {
  const allDiv = document.querySelectorAll(".wrapper .card");


  fetch(`https://6825adbb0f0188d7e72df09a.mockapi.io/users/users/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      const notyf = new Notyf({
        duration: 3000,
        ripple: true,
        position: { x: "right", y: "top" },
      });

      if (response.ok) {
        notyf.success("Foydalanuvchi muvaffaqiyatli o‘chirildi");

        if (allDiv[index]) {
          allDiv[index].remove();
        }
      } else {
        notyf.error("Foydalanuvchini o‘chirishda xatolik yuz berdi");
      }
    })
    .catch((error) => {
      console.error("API chaqiruvda xatolik:", error);
    });
}

function updateCard(id, index) {
  fetch(`https://6825adbb0f0188d7e72df09a.mockapi.io/users/users/${id}`)
    .then((response) => response.json())
    .then((data) => {
      let namePromt = prompt("Ism kiriting:", data.firstName || "");

      fetch(`https://6825adbb0f0188d7e72df09a.mockapi.io/users/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: namePromt,
        }),
      })
        .then((response) => {
          const notyf = new Notyf({
            duration: 3000,
            ripple: true,
            position: { x: "right", y: "top" },
          });

          if (response.ok) {
            notyf.success("Card successfully updated");
            document
              .querySelectorAll(".wrapper div")
              [index].querySelector(".firstName").textContent = namePromt;
            const card = document.querySelectorAll(".wrapper .card")[index];
            card.querySelector(".firstName").textContent = `Ism: ${namePromt}`;
          } else {
            notyf.error("Card unsuccessfully updated");
          }
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}

async function sortFunction() {
  const query = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;

  try {
    let response = await fetch("https://6825adbb0f0188d7e72df09a.mockapi.io/users/users");
    let data = await response.json();

    let filtered = data.filter(user =>
      user.firstName.toLowerCase().includes(query)
    );

    if (sortValue === "a-z") {
      filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (sortValue === "z-a") {
      filtered.sort((a, b) => b.firstName.localeCompare(a.firstName));
    }
    wrapper.innerHTML = "";
    filtered.forEach((user, index) => {
      let div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <p class="firstName"><strong>Ism:</strong> ${user.firstName}</p>
        <button onclick="updateCard('${user.id}', ${index})">Update</button>
        <button onclick="deleteFunct('${user.id}', ${index})">Delete</button>
      `;
      wrapper.appendChild(div);
    });

  } catch (error) {
    console.error("Sort yoki filterda xatolik:", error);
  }
}
searchInput.addEventListener("input", sortFunction);
sortSelect.addEventListener("change", sortFunction);