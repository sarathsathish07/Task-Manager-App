import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();
  const isLoginPage = location.pathname === "/login";

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const navbarColor = "rgba(50, 115, 245, 255)";

  return (
    <header>
      <Navbar className="bg-primary" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <i
                className="fa-regular fa-calendar-minus"
                style={{ color: "white" }}
              ></i>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <Button
                  onClick={logoutHandler}
                  style={{
                    backgroundColor: "rgba(245,100,100,255)",
                    color: "white",
                    border: "none",
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Button
                      className={
                        isLoginPage ? "custom-login-btn" : "custom-signup-btn"
                      }
                    >
                      Login
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Button
                      className={
                        isLoginPage ? "custom-signup-btn" : "custom-login-btn"
                      }
                    >
                      Signup
                    </Button>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
