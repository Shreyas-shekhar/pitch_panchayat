const elements=document.querySelectorAll('.hidden');

const observer=new IntersectionObserver(entries=> {
    entries.forEach(entry=>{
        if(entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
});


const timeline = document.querySelector('.timeline');
const progress = document.querySelector('.timeline-progress');

if (timeline && progress) {

    window.addEventListener('scroll', () => {

        const rect = timeline.getBoundingClientRect();

        const windowHeight = window.innerHeight;
        const totalHeight = timeline.offsetHeight;

        const progressValue =
            ((windowHeight - rect.top) / totalHeight) * 100;

        const clamped = Math.min(
            Math.max(progressValue, 0),
            100
        );

        progress.style.height = clamped + "%";

    });

}

const faqButtons =
document.querySelectorAll('.faq-btn');

faqButtons.forEach(button=>{

button.addEventListener('click',()=>{

const content =
button.nextElementSibling;

content.style.display =
content.style.display === 'block'
? 'none'
: 'block';

});

});

window.addEventListener("scroll",()=>{

    const nav =
    document.querySelector(".parliament-nav");

    if(window.scrollY > 100){

        nav.style.padding =
        "10px 24px";

        nav.style.top =
        "10px";

    }else{

        nav.style.padding =
        "16px 28px";

        nav.style.top =
        "20px";
    }

});