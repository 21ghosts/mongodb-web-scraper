$(document).ready(() => {

    $.getJSON("/api/comments", (data) => {
        for (let j = 0; j < data.length; i++) {
            var comment = $('<div>').addClass("comment").attr("comment-id", data[j]._id);
            comment.append($("<p>").addClass("comment-name").text(data[j].user + " said: "));
            comment.append($("<p>").addClass("comment-text").text(data[j].textContent));
            comment.append($("<a>").addClass("comment-article").attr("href", data[i].article.url).text("...about " + data[j].article.headline));


            $("#comments").append(comment);
        }
    });

})