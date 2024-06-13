document.addEventListener("DOMContentLoaded", function() {
    var video = document.querySelector('.video-fit');
    var buttonImage = document.getElementById('buttonImage');
    

    video.addEventListener('ended', function() {
        buttonImage.style.display = 'block';
    }, false);
});

