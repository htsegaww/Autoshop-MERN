import { Button, Col, Row, TimePicker, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
// import MechanicForm from "../components/MechanicForm";
import moment from "moment";

function BookAppointment() {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const { user } = useSelector((state) => state.user);
  const [mechanic, setMechanic] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  const getMechanicData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/mechanic/get-mechanic-info-by-id",
        {
          mechanicId: params.mechanicId,
        },

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        setMechanic(response.data.data);
        // dispatch(reloadUserData(false));
      }
    } catch (error) {
      console.log(error);
      dispatch(hideLoading());
    }
  };

  const checkAvailability = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-availability",
        {
          mechanicId: params.mechanicId,
          date: date,
          time: time,
        },

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("error booking appointment");
      dispatch(hideLoading());
    }
  };
  const bookNow = async () => {
    setIsAvailable(false);
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          mechanicId: params.mechanicId,
          userId: user._id,
          mechanicInfo: mechanic,
          userInfo: user,
          date: date,
          time: time,
        },

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/appointments");
      }
    } catch (error) {
      console.log(error);
      toast.error("error booking appointment");
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getMechanicData();
  }, []);
  return (
    <Layout>
      {mechanic && (
        <div>
          <h1 className="page-title">
            {mechanic.firstName} {mechanic.lastName}
          </h1>
          <hr />

          <Row gutter={20} className="mt-5" align="middle">
            <Col span={8} sm={24} xs={24} lg={8}>
              <img
                src="https://www.argyllhotelglasgow.co.uk/wp-content/uploads/2011/01/BOOK-NOW-for-Website2-1.png"
                alt=""
                width="100%"
                height="400"
              />
            </Col>
            <Col span={8} sm={24} xs={24} lg={8}>
              <h1 className="normal-text">
                <b>Timings :</b>
                {mechanic.timings[0]} - {mechanic.timings[1]}
              </h1>

              <p>
                <b>Phone Number: </b>
                {mechanic.phoneNumber}
              </p>

              <p>
                <b>Address: </b>
                {mechanic.address}
              </p>

              <div className="d-flex flex-column pt-2">
                <DatePicker
                  format="DD-MM-YYYY"
                  onChange={(value) => {
                    setDate(moment(value).format("DD-MM-YYYY"));
                    setIsAvailable(false);
                  }}
                />
                <TimePicker
                  format="HH:mm"
                  className="mt-3"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(moment(value).format("HH:mm"));
                  }}
                />

                {!isAvailable && (
                  <Button
                    className="primary-button mt-3 full-width-button"
                    onClick={checkAvailability}
                  >
                    Check Availability
                  </Button>
                )}

                {isAvailable && (
                  <Button
                    className="primary-button mt-3 full-width-button"
                    onClick={bookNow}
                  >
                    BOOK NOW
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Layout>
  );
}

export default BookAppointment;
