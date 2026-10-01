import streamlit as st
from db import get_user_startups, delete_startup


def render_my_startups_page():
    """
    Render the existing My Startups page with the added Delete Startup button
    and confirmation flow ([Cancel] / [Yes, Delete Startup]).
    """
    user_id = st.session_state.get("user_id")
    if not user_id:
        st.warning("Please log in to view your startups.")
        return

    if "confirm_delete_startup_id" not in st.session_state:
        st.session_state.confirm_delete_startup_id = None
    if "delete_success_msg" not in st.session_state:
        st.session_state.delete_success_msg = None

    st.subheader("My Startups")

    if st.session_state.delete_success_msg:
        st.success(st.session_state.delete_success_msg)
        st.session_state.delete_success_msg = None

    startups = get_user_startups(user_id)

    # Keep active startup selection in sync when a startup is deleted
    valid_ids = [s["startup_id"] for s in startups]
    if st.session_state.get("active_startup_id") not in valid_ids:
        st.session_state.active_startup_id = valid_ids[0] if valid_ids else None

    if not startups:
        st.info("No startups found.")
        return

    for startup in startups:
        startup_id = startup["startup_id"]
        startup_name = startup["startup_name"]
        industry = startup["industry"]
        stage = startup["execution_stage"]
        investment = float(startup.get("estimated_investment") or 0)
        monthly_revenue = float(startup.get("projected_monthly_revenue") or 0)

        with st.container(border=True):
            st.markdown(f"### {startup_name}")
            st.write(f"**Industry:** {industry}")
            st.write(f"**Stage:** {stage}")
            st.write(f"**Investment:** ${investment:,.0f}")
            st.write(f"**Monthly Revenue:** ${monthly_revenue:,.0f}")

            col1, col2, _ = st.columns([1.5, 1.5, 5])
            with col1:
                if st.button(
                    "View Details",
                    key=f"view_details_{startup_id}",
                    use_container_width=True,
                ):
                    st.session_state.active_startup_id = startup_id
                    st.session_state.current_page = "Dashboard"
                    st.rerun()

            with col2:
                if st.button(
                    "Delete Startup",
                    key=f"delete_startup_{startup_id}",
                    use_container_width=True,
                ):
                    st.session_state.confirm_delete_startup_id = startup_id
                    st.rerun()

            # Confirmation before deleting
            if st.session_state.confirm_delete_startup_id == startup_id:
                st.warning(f'Are you sure you want to delete "{startup_name}"?')
                c_cancel, c_confirm, _ = st.columns([1.2, 1.8, 5])

                with c_cancel:
                    if st.button(
                        "Cancel",
                        key=f"cancel_delete_{startup_id}",
                        use_container_width=True,
                    ):
                        st.session_state.confirm_delete_startup_id = None
                        st.rerun()

                with c_confirm:
                    if st.button(
                        "Yes, Delete Startup",
                        key=f"confirm_delete_{startup_id}",
                        type="primary",
                        use_container_width=True,
                    ):
                        success, message = delete_startup(startup_id, user_id)
                        st.session_state.confirm_delete_startup_id = None

                        if success:
                            if st.session_state.get("active_startup_id") == startup_id:
                                remaining = [
                                    s["startup_id"]
                                    for s in startups
                                    if s["startup_id"] != startup_id
                                ]
                                st.session_state.active_startup_id = (
                                    remaining[0] if remaining else None
                                )
                            st.session_state.delete_success_msg = "Startup deleted successfully."
                            st.rerun()
                        else:
                            st.error(message)
