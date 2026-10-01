import streamlit as st
from db import get_user_startups
from auth import render_auth_page
from my_startups import render_my_startups_page

st.set_page_config(
    page_title="AI Founder Assistant – Your Startup Co-Pilot",
    page_icon="🚀",
    layout="wide",
)

PAGE_ORDER = [
    "Dashboard",
    "Create Startup",
    "My Startups",
    "Competitors",
    "SWOT Analysis",
    "Tasks",
    "Startup Summary",
    "AI Suggestions",
]


def render_back_next_buttons():
    """
    Render the '← Back' (left-aligned) and 'Next →' (right-aligned)
    navigation buttons at the TOP of the main content area, before
    the page title and page content.
    """
    current_page = st.session_state.get("current_page", "Dashboard")
    if current_page not in PAGE_ORDER:
        current_idx = 0
    else:
        current_idx = PAGE_ORDER.index(current_page)

    is_first_page = current_idx == 0
    is_last_page = current_idx == len(PAGE_ORDER) - 1

    col_back, _, col_next = st.columns([1.5, 5, 1.5])

    with col_back:
        if st.button(
            "← Back",
            key=f"top_back_{current_page}",
            disabled=is_first_page,
            use_container_width=True,
        ):
            st.session_state.current_page = PAGE_ORDER[current_idx - 1]
            st.rerun()

    with col_next:
        if st.button(
            "Next →",
            key=f"top_next_{current_page}",
            disabled=is_last_page,
            use_container_width=True,
        ):
            st.session_state.current_page = PAGE_ORDER[current_idx + 1]
            st.rerun()


def main():
    if "logged_in" not in st.session_state:
        st.session_state["logged_in"] = False

    if not st.session_state["logged_in"]:
        render_auth_page()
        return

    if "current_page" not in st.session_state:
        st.session_state["current_page"] = "Dashboard"

    user_startups = get_user_startups(st.session_state["user_id"])
    valid_ids = [s["startup_id"] for s in user_startups]

    if st.session_state.get("active_startup_id") not in valid_ids:
        st.session_state["active_startup_id"] = valid_ids[0] if valid_ids else None

    with st.sidebar:
        st.markdown("### 🚀 AI Founder Assistant")
        st.caption("Your Startup Co-Pilot")
        st.divider()

        if user_startups:
            startup_labels = {
                s["startup_id"]: f"{s['startup_name']} ({s['execution_stage']})"
                for s in user_startups
            }
            selected_id = st.selectbox(
                f"Active Startup ({len(user_startups)})",
                options=list(startup_labels.keys()),
                format_func=lambda sid: startup_labels[sid],
                index=list(startup_labels.keys()).index(st.session_state["active_startup_id"])
                if st.session_state["active_startup_id"] in startup_labels
                else 0,
            )
            st.session_state["active_startup_id"] = selected_id
        else:
            st.info("No startups available. Create one to begin.")

        st.divider()

        for item in PAGE_ORDER:
            if st.button(
                item,
                key=f"nav_{item}",
                use_container_width=True,
                type="primary" if st.session_state["current_page"] == item else "secondary",
            ):
                st.session_state["current_page"] = item
                st.rerun()

        st.divider()
        if st.button("Logout", use_container_width=True):
            st.session_state.clear()
            st.rerun()

    # 1. Back / Next navigation at the TOP of the main content area
    render_back_next_buttons()

    # 2. Then page title and existing page content
    current_page = st.session_state["current_page"]

    if current_page == "My Startups":
        render_my_startups_page()


if __name__ == "__main__":
    main()
