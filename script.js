document.addEventListener("DOMContentLoaded", function () {
  /***********************************
   *           LOCAL STORAGE
   ***********************************/
  function loadProfiles() {
    const stored = localStorage.getItem("wishboard_profiles");
    if (stored) {
      return JSON.parse(stored);
    }
    // Default profiles
    return {
      Ana: {
        wishes: [],  // Stored as an array of objects: { text: '', done: false }
        pic: null
      },
      Luka: {
        wishes: [],
        pic: null
      }
    };
  }

  function saveProfiles() {
    localStorage.setItem("wishboard_profiles", JSON.stringify(profiles));
  }

  let profiles = loadProfiles();
  let currentProfile = "";

  /***********************************
   *            DOM ELEMENTS
   ***********************************/
  const landingPage = document.getElementById("landingPage");
  const profilesPage = document.getElementById("profilesPage");
  const profilePage = document.getElementById("profilePage");

  const continueBtn = document.getElementById("continueBtn");
  const backFromProfiles = document.getElementById("backFromProfiles");
  const backFromProfile = document.getElementById("backFromProfile");

  const profilesContainer = document.getElementById("profilesContainer");
  const addProfileBtn = document.getElementById("addProfileBtn");
  const newProfileInput = document.getElementById("newProfileInput");
  const profilePicInput = document.getElementById("profilePicInput");

  const profileNameHeader = document.getElementById("profileNameHeader");
  const profileImage = document.getElementById("profileImage");
  const wishesGrid = document.getElementById("wishesGrid");

  /***********************************
   *        PAGE NAVIGATION
   ***********************************/
  function showPage(page) {
    landingPage.style.display = "none";
    profilesPage.style.display = "none";
    profilePage.style.display = "none";
    page.style.display = "block";
  }

  // Start on the landing page
  showPage(landingPage);

  continueBtn.addEventListener("click", function () {
    showPage(profilesPage);
    renderProfiles();
  });
  backFromProfiles.addEventListener("click", function () {
    document.body.classList.remove("pink-theme");
    showPage(landingPage);
  });
  
  backFromProfile.addEventListener("click", function () {
    document.body.classList.remove("pink-theme");
    showPage(profilesPage);
    renderProfiles();
  });

  /***********************************
   *        RENDER PROFILES
   ***********************************/
  function renderProfiles() {
    profilesContainer.innerHTML = "";
    for (let profile in profiles) {
      const btn = document.createElement("button");
      btn.className = "profile-btn";
      btn.textContent = profile;
      btn.dataset.profile = profile;

      // Add thumbnail if profile picture exists
      if (profiles[profile].pic) {
        const img = document.createElement("img");
        img.src = profiles[profile].pic;
        img.alt = profile + "'s picture";
        img.className = "profile-pic-thumb";
        btn.prepend(img);
      }

      // Single vs. double click logic
      let clickTimer = null;
      btn.addEventListener("click", function () {
        if (clickTimer === null) {
          clickTimer = setTimeout(() => {
            currentProfile = profile;
            openProfile(profile);
            clickTimer = null;
          }, 250);
        }
      });

      btn.addEventListener("dblclick", function (e) {
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        // Toggle trash icon for deletion
        const existingTrash = btn.querySelector(".trash-icon");
        if (!existingTrash) {
          const trashIcon = document.createElement("span");
          trashIcon.className = "trash-icon";
          trashIcon.innerHTML = " 🗑";
          trashIcon.addEventListener("click", function (ev) {
            ev.stopPropagation();
            delete profiles[profile];
            saveProfiles();
            renderProfiles();
          });
          btn.appendChild(trashIcon);
        } else {
          existingTrash.remove();
        }
      });
      profilesContainer.appendChild(btn);
    }
  }

  /***********************************
   *        OPEN PROFILE PAGE
   ***********************************/
  function openProfile(profile) {
    profileNameHeader.textContent = profile + "'s Wishes";
    if (profiles[profile].pic) {
      profileImage.src = profiles[profile].pic;
      profileImage.style.display = "block";
    } else {
      profileImage.style.display = "none";
    }
    // Ensure all wishes are objects: { text, done }
    profiles[profile].wishes = profiles[profile].wishes.map(wish => {
      if (typeof wish === "string") {
        return { text: wish, done: false };
      }
      return wish;
    });
    saveProfiles();

    // Normalize profile name (remove accents and convert to lowercase)
    const normalized = profile.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    // If the name matches one of the specified variants, apply the pink theme to the whole site.
    if (["ana", "anc", "anna", "anci"].includes(normalized)) {
      document.body.classList.add("pink-theme");
    } else {
      document.body.classList.remove("pink-theme");
    }

    renderWishesGrid();
    showPage(profilePage);
  }

  /***********************************
   *       RENDER WISHES (GRID)
   ***********************************/
  function renderWishesGrid() {
    wishesGrid.innerHTML = "";
    const current = profiles[currentProfile];
    const wishes = current.wishes;

    // If no wishes, show only the plus card
    if (wishes.length === 0) {
      const plusCard = document.createElement("div");
      plusCard.className = "wish-card add";
      plusCard.textContent = "+";
      plusCard.addEventListener("click", () => handleAddWishClick(plusCard));
      wishesGrid.appendChild(plusCard);
      return;
    }

    // Render each wish as a card
    wishes.forEach((wishObj, index) => {
      const card = document.createElement("div");
      card.className = "wish-card";
      if (wishObj.done) {
        card.classList.add("done");
      }

      // Limit displayed text to 74 characters (with ellipsis)
      const displayText =
        wishObj.text.length > 74
          ? wishObj.text.substring(0, 74) + "…"
          : wishObj.text;

      const textEl = document.createElement("div");
      textEl.className = "wish-text";
      textEl.textContent = displayText;
      card.appendChild(textEl);

      // Actions: check, edit, delete
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "wish-actions";

      const checkBtn = document.createElement("button");
      checkBtn.textContent = "✓";
      checkBtn.addEventListener("click", () => {
        wishObj.done = !wishObj.done;
        saveProfiles();
        renderWishesGrid();
      });
      actionsDiv.appendChild(checkBtn);

      const editBtn = document.createElement("button");
      editBtn.textContent = "✎";
      editBtn.addEventListener("click", () => {
        let newWish = prompt("Edit your wish:", wishObj.text);
        if (newWish !== null && newWish.trim() !== "") {
          newWish = newWish.trim().substring(0, 74);
          wishObj.text = newWish;
          saveProfiles();
          renderWishesGrid();
        }
      });
      actionsDiv.appendChild(editBtn);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "x";
      deleteBtn.addEventListener("click", () => {
        wishes.splice(index, 1);
        saveProfiles();
        renderWishesGrid();
      });
      actionsDiv.appendChild(deleteBtn);

      card.appendChild(actionsDiv);
      wishesGrid.appendChild(card);
    });

    // Always add the plus card at the end
    const plusCard = document.createElement("div");
    plusCard.className = "wish-card add";
    plusCard.textContent = "+";
    plusCard.addEventListener("click", () => handleAddWishClick(plusCard));
    wishesGrid.appendChild(plusCard);
  }

  /***********************************
   *  PLUS CARD -> INPUT (ADD WISH)
   ***********************************/
  function handleAddWishClick(plusCard) {
    plusCard.innerHTML = "";
    plusCard.classList.remove("add");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "add-input";
    input.placeholder = "Type a wish & press Enter";
    // Enforce a 74-character maximum
    input.setAttribute("maxlength", "74");
    plusCard.appendChild(input);
    input.focus();

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const text = input.value.trim();
        if (text !== "") {
          profiles[currentProfile].wishes.push({ text, done: false });
          saveProfiles();
        }
        renderWishesGrid();
      }
    });

    input.addEventListener("blur", () => {
      renderWishesGrid();
    });
  }

  /***********************************
   *   ADDING NEW PROFILES
   ***********************************/
  addProfileBtn.addEventListener("click", function () {
    newProfileInput.style.display = "block";
    profilePicInput.style.display = "block";
    newProfileInput.focus();
  });

  newProfileInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const newName = newProfileInput.value.trim();
      if (newName !== "" && !profiles.hasOwnProperty(newName)) {
        if (profilePicInput.files && profilePicInput.files[0]) {
          const reader = new FileReader();
          reader.onload = function (event) {
            profiles[newName] = { wishes: [], pic: event.target.result };
            saveProfiles();
            newProfileInput.value = "";
            newProfileInput.style.display = "none";
            profilePicInput.value = "";
            profilePicInput.style.display = "none";
            renderProfiles();
          };
          reader.readAsDataURL(profilePicInput.files[0]);
        } else {
          profiles[newName] = { wishes: [], pic: null };
          saveProfiles();
          newProfileInput.value = "";
          newProfileInput.style.display = "none";
          profilePicInput.style.display = "none";
          renderProfiles();
        }
      }
    }
  });
});
