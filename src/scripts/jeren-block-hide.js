function hide_sec(id) {
    const sec = document.getElementById(id);
    const sec_list = {id:""}
    sec.classList.add()
}
function start_process(data,sec_hide,sec_enable) {
        console.log(data)
        const hd_ele = document.getElementById(sec_hide);
        const en_ele = document.getElementById(sec_enable);
        hd_ele.classList.toggle("global_inactive")
        en_ele.classList.toggle("global_inactive")
        // curr_ele.addEventListener("click", (e) => {
            
        //     curr_ele.classList.toggle("global_inactive")
        //     document.getElementById(sec["next_id"]).classList.toggle("global_inactive")
        // });
}
function start_default_listners() {
    Array.from(document.getElementsByClassName("j_tabs")).forEach(element => {
        element.addEventListener("click", (e) => {
            start_process(e.target, 'j_trns_type_tabs_sec', '_j_lhs_sec');
        });
    });
}
start_default_listners()