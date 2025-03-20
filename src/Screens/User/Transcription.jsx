import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Helpers from "../../Config/Helpers";
import { useHeader } from "../../Components/HeaderContext";
import SummaryFormatter from "../../Components/SummaryFormatter";

function Transcription() {
  const { setHeaderData } = useHeader();
  useEffect(() => {
    setHeaderData({
      title: Helpers.getTranslationValue("transcription_details"),
      desc: "",
    });
  }, [setHeaderData]);

  const location = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const [date, setDate] = useState("");
  const [theme, setTheme] = useState("");
  const [participants, setParticipants] = useState("");
  const [author, setAuthor] = useState("");
  // const [branchManager, setBranchManager] = useState("");
  // const [partnerNumbers, setPartnerNumbers] = useState([]);
  // const [partnerNumber, setPartnerNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      setEmail(Helpers.authUser?.email || "");
      setText(location.state.text || "");
      setSummary(location.state.summary || "");
    }
  }, [location.state]);

  // useEffect(() => {
  //   const fetchSendEmail = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${Helpers.apiUrl}getUserData`, // Update the endpoint according to your backend route
  //         Helpers.authHeaders
  //       );

  //       const userData = response.data ?? {};

  //       // setEmail(userData.email || ""); // Set email from the user's data if email exists
  //     } catch (error) {
  //       console.error(error);
  //       Helpers.toast('error', error.message);
  //     }
  //   };

  //   fetchSendEmail();
  // }, []);

  // useEffect(() => {
  //   const fetchPartnerNumbers = async () => {
  //     try {
  //       const response = await axios.get(`${Helpers.apiUrl}getData`, Helpers.authHeaders);
  //       setPartnerNumbers(response.data);
  //     } catch (error) {
  //       Helpers.toast('error', error.message);
  //     }
  //   };

  //   fetchPartnerNumbers();
  // }, []);

  useEffect(() => {
    const fetchLatestNumber = async () => {
      try {
        const response = await axios.get(
          `${Helpers.apiUrl}getLatestNumber/${location.state.summary_id}`,
          Helpers.authHeaders
        );
        const data = response.data ?? {};
        const dateStr = data.Datum ?? "";
        const theme = data.Thema ?? "";
        const author = data.auther ?? "";
        // const branchManager = data.Niederlassungsleiter ?? '';
        const participants = data.Teilnehmer ?? "";

        let parsedDate = "";
        if (dateStr) {
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            parsedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        setDate(parsedDate);

        setTheme(theme);
        setAuthor(author);
        // setBranchManager(branchManager);
        setParticipants(participants);
      } catch (error) {
        console.error(error);
        Helpers.toast("error", error.message);
      }
    };

    fetchLatestNumber();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${Helpers.apiUrl}sendEmail`,
        {
          email,
          transcriptionText: text,
          summary,
          date,
          theme,
          // partnerNumber,
          // branchManager,
          participants,
          author,
        },
        Helpers.authHeaders
      );

      setSuccess(true);
      navigate("/");
    } catch (error) {
      Helpers.toast("error", error.message);
    }
    setLoading(false);
  };

  const back = () => {
    window.history.back();
  };

  // const options = partnerNumbers.map((partner) => ({
  //   value: { number: partner.number, name: partner.name, street: partner.street },
  //   label: `${partner.number} / ${partner.name} / ${partner.street}`,
  // }));

  // const handleChange = (selectedOption) => {
  //   setPartnerNumber(selectedOption);
  // };

  return (
    <section className="bg-white p-5">
      <div className="flex flex-col lg:flex-row justify-between lg:px-12">
        <div className="xl:w-full lg:w-88 px-5 xl:pl-12">
          <div className="max-w-[614px] m-auto py-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-center text-2xl font-semibold mb-8">
                {Helpers.getTranslationValue("transcription_details")}
              </h2>

              <div className="flex flex-col items-center">
                {success ? (
                  <p className="text-center mb-4">
                    {Helpers.getTranslationValue("transcription_send_to")}{" "}
                    {Helpers.authUser?.email}!
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("date")}:
                      </label>
                      <input
                        type="date"
                        placeholder={Helpers.getTranslationValue("date")}
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("topic")}:
                      </label>
                      <input
                        type="text"
                        placeholder={Helpers.getTranslationValue("topic")}
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">Gesellschafternummer:</label>
                      <Select
                        className="border border-bgray-300 rounded-lg px-4 py-3.5"
                        value={options.find(
                          (option) => option.value.number === partnerNumber
                        )}
                        onChange={handleChange}
                        options={options}
                      />
                    </div> */}
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("author")}:
                      </label>
                      <input
                        type="text"
                        placeholder={Helpers.getTranslationValue("author")}
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("participant")}:
                      </label>
                      <input
                        type="text"
                        placeholder={Helpers.authUser?.name}
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={Helpers.authUser?.name}
                        onChange={(e) => setParticipants(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("email")}:
                      </label>
                      <input
                        type="email"
                        placeholder={Helpers.getTranslationValue("Email")}
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={email} // Bind it to the state email
                        onChange={(e) => setEmail(e.target.value)} // Update state on change
                      />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">Niederlassungsleiter:</label>
                      <input
                        type="text"
                        className="border border-bgray-300 h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={branchManager}
                        onChange={(e) => setBranchManager(e.target.value)}
                      />
                    </div> */}
                    {/* <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("transcription")}:
                      </label>
                      <textarea
                        className="border border-bgray-300 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        rows={8}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={Helpers.getTranslationValue(
                          "transcription"
                        )}
                      />
                    </div> */}
                    <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("summary")}
                      </label>
                      {/* Use SummaryFormatter to format and display the summary */}
                      <SummaryFormatter summary={summary} />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">
                        {Helpers.getTranslationValue("summary")}
                      </label>
                      <textarea
                        className="border border-bgray-300 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        rows={8}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder={Helpers.getTranslationValue("summary")}
                      />
                    </div> */}
                    <button
                      type="submit"
                      className="mt-6 py-3.5 flex items-center justify-center text-white font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg w-full"
                      disabled={loading}
                    >
                      {Helpers.getTranslationValue(
                        loading ? "sending.." : "send_transcription"
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-4 py-3.5 flex items-center justify-center bg-gray-300 rounded-lg w-full hover:bg-gray-400 hover:bg-white-300"
                      onClick={back}
                    >
                      {Helpers.getTranslationValue("Back")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Transcription;
