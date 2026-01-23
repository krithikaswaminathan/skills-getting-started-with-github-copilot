document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = ""; // Clear previous options

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic info
        const title = document.createElement('h4');
        title.textContent = name;

        const desc = document.createElement('p');
        desc.textContent = details.description;

        const sched = document.createElement('p');
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const availability = document.createElement('p');
        availability.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(sched);
        activityCard.appendChild(availability);

        // Participants list (hidden bullets, with delete buttons)
        const participantsWrap = document.createElement('div');
        participantsWrap.className = 'participants';

        const partTitle = document.createElement('p');
        partTitle.innerHTML = '<strong>Participants:</strong>';
        participantsWrap.appendChild(partTitle);

        const ul = document.createElement('ul');
        ul.className = 'participants-list';

        if (Array.isArray(details.participants) && details.participants.length) {
          details.participants.forEach(email => {
            const li = document.createElement('li');
            li.className = 'participants-item';

            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = email;

            const btn = document.createElement('button');
            btn.className = 'participant-remove';
            btn.setAttribute('aria-label', `Remove ${email}`);
            btn.dataset.activity = name;
            btn.dataset.email = email;
            btn.title = 'Remove participant';
            btn.innerHTML = '✕';

            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              const act = btn.dataset.activity;
              const em = btn.dataset.email;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(act)}/participants?email=${encodeURIComponent(em)}`, {
                  method: 'DELETE'
                });
                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                  messageDiv.textContent = body.message || 'Participant removed';
                  messageDiv.classList.remove('hidden');
                  messageDiv.classList.add('success');
                  messageDiv.classList.remove('error');
                  // Refresh activities
                  fetchActivities();
                } else {
                  messageDiv.textContent = body.detail || 'Failed to remove participant';
                  messageDiv.classList.remove('hidden');
                  messageDiv.classList.add('error');
                  messageDiv.classList.remove('success');
                }
                setTimeout(() => messageDiv.classList.add('hidden'), 4000);
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant';
                messageDiv.classList.remove('hidden');
                messageDiv.className = 'message error';
                setTimeout(() => messageDiv.classList.add('hidden'), 4000);
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
        } else {
          const none = document.createElement('p');
          none.className = 'info';
          none.textContent = 'No participants yet';
          participantsWrap.appendChild(none);
        }

        participantsWrap.appendChild(ul);
        activityCard.appendChild(participantsWrap);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.classList.add("message", "success");
        messageDiv.classList.remove("error");
        signupForm.reset();
        // Refresh activities so the newly signed-up participant appears
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.classList.add("message", "error");
        messageDiv.classList.remove("success");
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.classList.add("message", "error");
      messageDiv.classList.remove("success");
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
