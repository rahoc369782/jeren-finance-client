"use strict";
function patterns() {
  return {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  };
}

async function call_api() {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Done");
    }, 2000);
  });
}

function apply_keypress_event() {
  document.querySelectorAll("[common-input]").forEach((input) => {
    input.addEventListener("keypress", (e) => {
      let cur_btn = document.querySelector(`[${input.getAttribute("btn")}]`);
      if (e.keyCode === 13) {
        if (cur_btn) {
          cur_btn.click();
        }
      }
    });
  });
}
function disable_wrong_input() {
  let warning_ele = document.getElementsByClassName("wrong_input")[0];
  warning_ele.classList.remove("wrong_input_active");
  warning_ele.children[0].children[0].innerText = "";
}
function common_btn_clicked_fun(btn) {
  btn.disabled = true;
  btn.innerHTML =
    '<div class="dot-spinner"><div></div><div></div><div></div><div></div></div>';
  btn.classList.add("btn_clicked_animation");
}

function common_btn_unclicked_fun(btn, text) {
  btn.innerHTML = text;
  btn.disabled = false;
  btn.classList.remove("btn_clicked_animation");
}

function display_messages(btn, message) {
  let warning_ele = document.getElementsByClassName("wrong_input")[0];
  warning_ele.children[0].children[0].innerText = message;
  btn.classList.add("wrong_input_highlight");
  warning_ele.classList.add("wrong_input_active");
  setTimeout(() => {
    btn.classList.remove("wrong_input_highlight");
  }, 500);
}

async function authenticate_user(event, flow) {
  common_btn_clicked_fun(event.target);
  disable_wrong_input();
  let username = document.getElementById("lg_email_value");
  let password = document.getElementById("lg_password_value");
  if (!username.value) {
    common_btn_unclicked_fun(event.target, "Login");
    return display_messages(event.target, "Please enter valid username");
  }
  if (!password.value) {
    common_btn_unclicked_fun(event.target, "Login");
    return display_messages(event.target, "Please enter valid username");
  }
  await call_api();
  let user_id_field2 = document.querySelector("[user-unique-id]");
  user_id_field2.innerText = username.value;
  username.value = "";
  password.value = "";
  common_btn_unclicked_fun(event.target, "Login");
  openlgBlock(event, "n");
}

document.getElementById("lg_otp_value").addEventListener("keyup", (e) => {
  if (e.target.value.length === 6) {
    e.target.blur();
    document.querySelector(`[${e.target.getAttribute("btn")}]`).click();
  }
});

async function authenticate_user_otp(event, flow) {
  common_btn_clicked_fun(event.target);
  disable_wrong_input();
  let username = document.getElementById("lg_email_value").value;
  let otp_ele = document.getElementById("lg_otp_value");
  let otp = otp_ele.value;
  if (!otp || otp.length < 6) {
    otp_ele.value = "";
    common_btn_unclicked_fun(event.target, "Verify");
    return display_messages(event.target, "Please enter valid OTP");
  }
  await call_api();
  localStorage.setItem(
    "_username_",
    document.querySelector("[user-unique-id]").innerText
  );
  common_btn_unclicked_fun(event.target, "Verify");
  return (window.location.href =
    "http://127.0.0.1:5501/src/templates/login.html");
}

// common function for checking cookie and make necessary restrictions;
function checkCockie() {
  let cookie = document.cookie;
  if (!cookie) {
    return enableRequiredBlock(null);
  }
  let c_obj = cookie
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
  return enableRequiredBlock(c_obj);
}
async function sendOtp(event, flow) {
  let userId = document.querySelector("#onb_email_input");
  let warning = document.querySelector("[rg-email-input-value]");

  if (!patterns().email.test(userId.value)) {
    return display_messages(
      event.target,
      warning,
      "Please enter correct email"
    );
  }
  let userIdElement = document.querySelector("[user-unique-id]");
  if (userIdElement) {
    userIdElement.innerText = userId.value;
  }
  await call_api();
  openrgBlock(event, flow);
}

function openlgBlock(event, flow) {
  let current_input_block = event.target.closest(".input_group_block");
  if (!current_input_block) {
    return;
  }
  if (current_input_block) {
    current_input_block.classList.remove("active_lg_inputblock");
  }
  if (flow === "n") {
    if (current_input_block.nextElementSibling) {
      current_input_block.nextElementSibling.classList.add(
        "active_lg_inputblock"
      );
      current_input_block.nextElementSibling.children[1].children[0].focus();
    }
  } else if (flow === "p") {
    if (current_input_block.previousElementSibling) {
      current_input_block.previousElementSibling.classList.add(
        "active_lg_inputblock"
      );
      current_input_block.previousElementSibling.children[1].children[0].focus();
    }
  }
}
