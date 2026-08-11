/* ======================================================
LINKWORLD EXPRESS
FAQ ACCORDION
Expands/collapses answers with a smooth height transition.
====================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const questions = document.querySelectorAll(".faq-question");

    questions.forEach(button => {

        button.addEventListener("click", () => toggleFaq(button));

    });

});


function toggleFaq(button){

    const item = button.closest(".faq-item");

    const answer = item.querySelector(".faq-answer");

    const isOpen = item.classList.contains("open");

    // close any other open item in the same category, accordion-style
    const list = item.closest(".faq-list");

    list.querySelectorAll(".faq-item.open").forEach(openItem => {

        if(openItem !== item){

            closeFaqItem(openItem);

        }

    });

    if(isOpen){

        closeFaqItem(item);

    }
    else{

        item.classList.add("open");

        answer.style.maxHeight = answer.scrollHeight + "px";

        button.setAttribute("aria-expanded", "true");

    }

}


function closeFaqItem(item){

    const answer = item.querySelector(".faq-answer");

    const button = item.querySelector(".faq-question");

    item.classList.remove("open");

    answer.style.maxHeight = null;

    button.setAttribute("aria-expanded", "false");

}
