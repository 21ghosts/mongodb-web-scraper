//Need to push to heroku
$(document).ready(() => {
    //need to add loading message that disappears when articles arrive
    $.getJSON("/scrape", (data) => {
        
        for (let i = 0; i < data.length; i++) {
            
            var comDiv = $('<div>').addClass("view-comments");
            if (data[i].comments.length > 0) {
                comDiv.append($('<button>').addClass("comment-view-btn btn").text("View comments"));
                for (var c in data[i].comments) {
                    var cdiv = $('<div>').addClass("article-comment hidden");
                    cdiv.append($('<p>').text(data[i].comments[c].user + ":\n" + data[i].comments[c].textContent).addClass('comment-text'));
                    comDiv.append(cdiv);
                }
            }
            var article = $('<div>').addClass("article card").attr("data-id", data[i]._id)
            article.append($('<div>').addClass("card-header").append($('<a>').addClass("headline").attr("href", data[i].url).text(data[i].headline)));
            article.append($('<p>').addClass("summary").text(data[i].summary))
            var comContainer = $("<div>").addClass("comment-container flex flex-between")
            comContainer.append($(`<div class="add-comment-section">
            <button class="comment-reveal-btn btn">Add Comment</button>
            <form class="comment-form hidden" action="/write" method="post">
                <div>
                    <label for="user_name">Name:</label>
                    <input type="text" class="user_name" name="user_name">
                </div>
                <div>
                    <label for="comment">Comment:</label>
                    <textarea class="comment" name="comment"></textarea>
                </div>
                <button class="comment-submit-btn btn" type="button">Submit comment!</button>
            
            </form>
            <div class="comment-message"></div>
            </div>`));
            comContainer.append(comDiv)
            article.append(comContainer)
            $("#articles").append(article)
        }
    });

    $(document).on("click", ".comment-submit-btn", (event) => {
        event.preventDefault();
        var form = $(this).parent();

        $.ajax({
            method: "POST",
            url: "/write",
            data: {
                article: form.parent().parent().parent().attr("data-id"),
                user: form.find(".user_name").val(),
                textContent: form.find(".comment").val()
            }
        })
            .done((data) => 
            {
                form.parent().children(".comment-message").empty();
                if (typeof (data) === "object") {
                    form.parent().children(".comment-message").append($("<p>").text("Thanks for submitting your comment! It's been processed successfully."))
                } else {
                    form.parent().children(".comment-message").append($("<p>").text("Sorry, something went wrong with submitting your comment! Please make sure all forms are filled out and try again."))
                }

            });

        form.find(".user_name").val("");
        form.find(".comment").val("");
    });

    $(document).on("click", ".comment-reveal-btn", (event) => {
        $(this).parent().children(".comment-form").toggle();
        if ($(this).text() === "Add Comment") {
            $(this).text("Close Comment Form");
        } else {
            $(this).text("Add Comment");
        }
    });

    $(document).on("click", ".comment-view-btn", (event) => $(this).parent().children(".article-comment").toggle());


});