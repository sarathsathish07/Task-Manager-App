import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  useLoginMutation,
  useGoogleLoginMutation,
} from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLogin] = useGoogleLoginMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleName = decoded.name;
      const googleEmail = decoded.email;

      const responseFromApiCall = await googleLogin({
        googleName,
        googleEmail,
      }).unwrap();
      dispatch(setCredentials({ ...responseFromApiCall }));
      navigate("/");
    } catch (error) {
      if (
        error.status === 401 &&
        error.data.message === "User is blocked or not authorized"
      ) {
        toast.error("User is blocked or not authorized");
      } else {
        toast.error(
          error.data?.message || "An error occurred during Google login"
        );
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const googleSignin = useGoogleLogin({
    onSuccess: (response) => {
      handleSuccess(response);
    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <Container>
      <Row className="justify-content-md-center mt-5 mb-3">
        <Col xs={12} md={4} style={{ paddingLeft: "0" }}>
          <h1 className="text-start login-title">Login</h1>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col xs={12} md={4} className="card p-4 login-card">
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="password">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                style={{ border: "1px solid ", borderRadius: "0px" }}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            {isLoading && <Loader />}

            <Button
              type="submit"
              variant="primary"
              className="mt-3 login-btn"
              style={{ width: "100%" }}
            >
              Login
            </Button>

            <Row className="py-3 justify-content-center">
              <Col className="text-center" style={{ fontWeight: "500" }}>
                Don't have an account? <Link to="/register">Signup</Link>
              </Col>
            </Row>
          </Form>
          <div
            className="text-center mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <button
              onClick={() => googleSignin()}
              className="btn btn-primary"
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                fontSize: "16px",
              }}
            >
              Login with<span style={{ fontWeight: "600" }}> Google</span>
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginScreen;
