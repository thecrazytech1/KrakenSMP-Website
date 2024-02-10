const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");

const openModalBtn = document.getElementById("btn-open");
const skinPreview = document.getElementById("skinPreview");

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

openModalBtn.addEventListener("click", openModal);

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

function getSkin() {
  const username = document.getElementById("username").value;

  if (username.trim() === "") {
    alert("Please enter a valid Minecraft username.");
    return;
  }

  // Use the Minecraft API to get the skin URL
  // const apiURL = `https://api.mojang.com/users/profiles/minecraft/${username}`;
  const apiURL = `https://playerdb.co/api/player/minecraft/${username}`;

  fetch(apiURL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data.player.raw_id) {
        const skinURL = `https://visage.surgeplay.com/full/384/${data.data.player.raw_id}`;

        // Create a new image element
        const image = new Image();

        // Set the source of the image
        image.src = skinURL;

        // Wait for the image to load before displaying it
        image.addEventListener("load", function () {
          skinPreview.innerHTML = "";
          skinPreview.appendChild(image);
          openModal();
        });
      } else {
        alert("Invalid Minecraft username. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error fetching skin:", error);
      alert("Error fetching skin. Please try again later.");
    });
}

function YesBtn() {
  const username = document.getElementById("username").value;
  const hider = document.getElementById("hider");

  hider.classList.add("hide");

  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "block";

  fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ username }),
  })
    .then((response) => {
      loadingElement.style.display = "none";

      if (!response.ok) {
        throw new Error(`HTTP error! ${response.data}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log(data);

      if (data.status === "Success") {
        window.location.href = "/Success";
      } else if (data.status === "AlreadyLinked") {
        window.location.href = "/AlreadyLinked";
      } else {
        // Handle other cases or show a generic message
        alert("Unexpected response. Please try again.");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function NoBtn() {
  closeModal;
}
