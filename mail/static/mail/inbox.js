document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#single-email-view").style.display = "none";
  document.querySelector("#compose-form").addEventListener("submit", function (e) {
      e.preventDefault();
      fetch("/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          // Print result
          console.log(result);

          // Clear out composition fields
          document.querySelector("#compose-recipients").value = "";
          document.querySelector("#compose-subject").value = "";
          document.querySelector("#compose-body").value = "";

          // Load Sent Mailbox
          load_mailbox("sent");
        });
    });
   
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#single-email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  
  // Show the emails of that particular mailbox 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log("all-emails");
      console.log(emails);
      // ... do something else with emails ...  
      
      emails.forEach(email => {
        console.log("single-email");
        console.log(email);
        
        const emails_div = document.querySelector("#emails-view");
        const single_email_div = document.createElement('div');
        
        
        const contents = `
                          <br> ${email.id} <br> 
                          From: ${email.sender} <br> 
                          TimeStamp: ${email.timestamp} <br>
                          Subject: ${email.subject} <br> 
                          
                          `                       
                          ;      
        
        single_email_div.innerHTML = contents;
        emails_div.append(single_email_div); 
        single_email_div.addEventListener("click", () => read_email(email.id));
        
        if(email.read === true)
        {single_email_div.style.backgroundColor = "lightgrey";}
        else
        {single_email_div.style.backgroundColor = "white";}
                               
              
      });
})
        
  }

// When a user clicks on an email, the user should be taken to a view where they see the content of that email

function read_email(emailId) {
  // SIRAJ FOR YOU TO COMPLETE    
  fetch(`/emails/${emailId}`)
  // Put response into json form
  .then(response => response.json())
  .then(email => {
      console.log("open-email");
     // show email and hide other views
     document.querySelector("#emails-view").style.display = "none";
     document.querySelector("#compose-view").style.display = "none";  
     document.querySelector("#single-email-view").style.display = "block";
    
     // display email
     const view = document.querySelector("#single-email-view");

     view.innerHTML =
                      `
                      TimeStamp: ${email.timestamp} <br>
                      From: ${email.sender} <br> 
                      Subject: ${email.subject} <br> 
                      Body: ${email.body} <br>
                      
                      `
                      

    console.log(email.read)
    if(email.read === false){
      fetch(`emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    // ARCHIVE and UNARCHIVE Button

    archiveButton = document.createElement("button");

    if(email.archived === false){
      archiveButton.innerHTML = "Archive";
      archiveButton.addEventListener("click", () => {
        fetch(`emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        })
        .then(response => load_mailbox('inbox'))
        
      })
      }
    else{
      archiveButton.innerHTML = "Unrchive";
      archiveButton.addEventListener("click", () => {
        fetch(`emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        })
        .then(response => load_mailbox('inbox'))
        
      })

    }


    console.log("archived:", email.archived);

    view.appendChild(archiveButton);

    


    // REPLY Button

    replyButton = document.createElement("button");
    replyButton.innerHTML = "Reply";

    replyButton.addEventListener("click", function(){
      compose_email();
      // Pre-fill the Recepient Field
      document.querySelector("#compose-recipients").value = email.sender;

      // Pre-fill the Subject Field
      let subject = email.subject;

      if (subject.split(" ", 1)[0] != "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;


      // Pre-fill the Body Field
      let body = `On ${email.timestamp} , ${email.sender} wrote: ${email.body}`;

      document.querySelector('#compose-body').value = body;

    })


      view.appendChild(replyButton);

    
    
      
  }) 
    
}