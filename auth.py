import re
import streamlit as st
from db import register_user, authenticate_user

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def render_auth_page():
    """
    Render the existing Login and Registration page in Streamlit and
    authenticate against the MySQL `users` table.
    """
    if "auth_mode" not in st.session_state:
        st.session_state["auth_mode"] = "login"

    col_left, col_center, col_right = st.columns([1, 1.4, 1])

    with col_center:
        st.markdown("## AI Founder Assistant")
        st.caption("Your Startup Co-Pilot")

        if st.session_state["auth_mode"] == "login":
            st.markdown("#### Sign in to your startup workspace")

            email = st.text_input("Email", key="login_email")
            password = st.text_input("Password", type="password", key="login_password")

            if st.button("Login", type="primary", use_container_width=True):
                clean_email = email.strip()

                if not clean_email or not password:
                    st.error("Please enter both your email address and password.")
                elif not EMAIL_REGEX.match(clean_email):
                    st.error("Please enter a valid email address format.")
                else:
                    success, message, user = authenticate_user(clean_email, password)
                    if success and user:
                        st.session_state["logged_in"] = True
                        st.session_state["user_id"] = user["user_id"]
                        st.session_state["username"] = user["username"]
                        st.session_state["email"] = user["email"]
                        st.session_state["current_page"] = "Dashboard"
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)

            if st.button("Don't have an account? Register", use_container_width=True):
                st.session_state["auth_mode"] = "register"
                st.rerun()

        else:
            st.markdown("#### Create your founder account")

            username = st.text_input("Full Name / Username", key="reg_username")
            email = st.text_input("Email", key="reg_email")
            password = st.text_input("Password", type="password", key="reg_password")
            confirm_password = st.text_input(
                "Confirm Password", type="password", key="reg_confirm_password"
            )

            if st.button("Create Account", type="primary", use_container_width=True):
                clean_username = username.strip()
                clean_email = email.strip()

                if not clean_username or not clean_email or not password or not confirm_password:
                    st.error("All fields are required.")
                elif not EMAIL_REGEX.match(clean_email):
                    st.error("Please enter a valid email address format.")
                elif len(password) < 8:
                    st.error("Password must be at least 8 characters long.")
                elif password != confirm_password:
                    st.error("Password and Confirm Password do not match.")
                else:
                    success, message, user = register_user(clean_username, clean_email, password)
                    if success and user:
                        st.session_state["logged_in"] = True
                        st.session_state["user_id"] = user["user_id"]
                        st.session_state["username"] = user["username"]
                        st.session_state["email"] = user["email"]
                        st.session_state["current_page"] = "Dashboard"
                        st.success(message)
                        st.rerun()
                    else:
                        st.error(message)

            if st.button("Already have an account? Login", use_container_width=True):
                st.session_state["auth_mode"] = "login"
                st.rerun()
