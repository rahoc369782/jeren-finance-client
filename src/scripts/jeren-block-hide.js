function hide_sec(id) {
  const sec = document.getElementById(id);
  const sec_list = { id: "" };
  sec.classList.add();
}
function start_process(data, sec_hide, sec_enable, statusbar_config) {
  const hd_ele = document.getElementById(sec_hide);
  const en_ele = document.getElementById(sec_enable);
  hd_ele.classList.toggle("global_inactive");
  en_ele.classList.toggle("global_inactive");
  TransactionProcessor.updateGlobalStatus(statusbar_config);
  // curr_ele.addEventListener("click", (e) => {

  //     curr_ele.classList.toggle("global_inactive")
  //     document.getElementById(sec["next_id"]).classList.toggle("global_inactive")
  // });
}
function start_default_listners() {
  Array.from(document.getElementsByClassName("j_tabs")).forEach((element) => {
    element.addEventListener("click", (e) => {
      start_process(e.target, "j_trns_type_tabs_sec", "_j_lhs_sec", {
        text: "Select accounts involved in transaction",
        status: "info",
      });
    });
  });
}

function formatIndianCurrency(amount) {
  if (typeof amount !== "number") {
    amount = parseFloat(amount);
    if (isNaN(amount)) return "Invalid amount";
  }

  // Convert the number to a string for manipulation
  const amountStr = amount.toString();

  // Check if the number has a decimal part
  const [wholePart, decimalPart] = amountStr.split(".");

  // Format the integer part
  let formatted = "";
  const length = wholePart.length;

  // Handle the last three digits (thousands)
  if (length > 3) {
    formatted = wholePart.slice(-3); // Get the last three digits
    let remaining = wholePart.slice(0, -3); // Remaining part of the number

    // Add commas for every two digits in the remaining part
    while (remaining.length > 2) {
      formatted = remaining.slice(-2) + "," + formatted;
      remaining = remaining.slice(0, -2);
    }

    // Add the remaining digits, if any
    if (remaining) {
      formatted = remaining + "," + formatted;
    }
  } else {
    formatted = wholePart; // For numbers less than 1000
  }

  // Append the decimal part if present
  if (decimalPart) {
    formatted += "." + decimalPart;
  }

  return "₹ " + formatted;
}

document.addEventListener("click", (e) => {
  const trns_name = "[trns-account-name]";
  let check_for_trns_name = e.target.closest(trns_name);
  if (check_for_trns_name) {
    if (check_for_trns_name.nextElementSibling) {
      document.querySelectorAll(trns_name).forEach((trns) => {
        trns.nextElementSibling.classList.remove("visible");
      });
      check_for_trns_name.nextElementSibling.classList.toggle("visible");
    }
  }
});

start_default_listners();
