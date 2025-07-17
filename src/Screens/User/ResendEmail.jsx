import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
// import Select from "react-select";
import Helpers from "../../Config/Helpers";
import { useHeader } from "../../Components/HeaderContext";

const ResendEmail = () => {
  const { setHeaderData } = useHeader();
  useEffect(() => {
    setHeaderData({ title: Helpers.getTranslationValue('resend_email'), desc: "" });
  }, [setHeaderData]);
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [date, setDate] = useState("");
  const [theme, setTheme] = useState("");
  // const [partner, setPartner] = useState(null);
  // const [branchManager, setBranchManager] = useState("");
  const [participants, setParticipants] = useState("");
  const [author, setAuthor] = useState("");
  // const [partnerNumbers, setPartnerNumbers] = useState([]);
  // const [partnerNumber, setPartnerNumber] = useState("");
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchEmail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${Helpers.apiUrl}getemailId/${userId}`,
          Helpers.authHeaders
        );
        const emailData = response.data.emails[0];
        setEmail(emailData.email || "");
        setText(emailData.transcriptionText || "");
        setSummary(emailData.summary || "");
        setDate(emailData.date || "");
        setTheme(emailData.theme || "");
        // setPartnerNumber(emailData.partnerNumber || "");
        // setBranchManager(emailData.branchManager || "");
        setParticipants(emailData.participants || "");
        setAuthor(emailData.author || "");
        setSuccess("");
      } catch (err) {
        Helpers.toast("error", Helpers.getTranslationValue('retrieve_email_error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchEmail();
    }
  }, [userId]);

  // useEffect(() => {
  //   const fetchPartnerNumbers = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${Helpers.apiUrl}getData`,
  //         Helpers.authHeaders
  //       );
  //       if (Array.isArray(response.data)) {
  //         setPartnerNumbers(response.data);
  //       } else {
  //         setPartnerNumbers([]); 
  //         console.error("Fetched data is not an array:", response);
  //       }
  //     } catch (error) {
  //       Helpers.toast("error", error.message);
  //       setPartnerNumbers([]); 
  //       console.error("Error fetching partner numbers:", error);
  //     }
  //   };

  //   fetchPartnerNumbers();
  // }, []);

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
          // partnerNumber: partner?.value.number,
          // branchManager,
          participants,
          author,
        },
        Helpers.authHeaders
      );
      setSuccess(Helpers.getTranslationValue('transcription_send_msg'));
    } catch (err) {
      Helpers.toast("error", Helpers.getTranslationValue('transcription_send_error'));
      setSuccess("");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // const options = partnerNumbers.map((partner) => ({
  //   value: {
  //     number: partner.number,
  //     name: partner.name,
  //     street: partner.street,
  //   },
  //   label: `${partner.number} / ${partner.name} / ${partner.street}`,
  // }));

  // const handleChange = (selectedOption) => {
  // setPartner(selectedOption);
  // setPartnerNumber(selectedOption?.value.number || "");
  // };

  const back = () => navigate("/voice");

  return (
    <section className="bg-white">
      <div className="flex flex-col lg:flex-row justify-between lg:px-12">
        <div className="xl:w-full lg:w-88 px-5 xl:pl-12">
          <div className="max-w-[614px] m-auto py-6">
            <div className="bg-white  p-4 rounded-lg shadow-md">
              <h2 className="text-center text-2xl font-semibold  mb-8">
                {Helpers.getTranslationValue('transcription_details')}
              </h2>
              <div className="flex flex-col items-center">
                {success ? (
                  <p className="text-center  mb-4">
                    {Helpers.getTranslationValue('transcription_send_to')} {email}!
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('date')}:</label>
                      <input
                        type="date"
                        placeholder={Helpers.getTranslationValue('date')}
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('topic')}:</label>
                      <input
                        type="text"
                        placeholder={Helpers.getTranslationValue('topic')}
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">Gesellschafternummer:</label>
                      <Select
                        className=" border border-bgray-300  rounded-lg px-4 py-3.5"
                        value={options.find(
                          (option) => option.value.number === partnerNumber
                        )}
                        onChange={handleChange}
                        options={options}
                      />
                    </div> */}
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('author')}:</label>
                      <input
                        type="text"
                        placeholder={Helpers.getTranslationValue('author')}
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base" value={author}
                        onChange={(e) => setAuthor(e.target.value)}

                      />
                    </div>
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('participant')}:</label>
                      <input
                        type="text"
                        placeholder={Helpers.getTranslationValue('participant')}
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={participants}
                        onChange={(e) => setParticipants(e.target.value)}
                      />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">Niederlassungsleiter:</label>
                      <input
                        type="text"
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={branchManager}
                        onChange={(e) => setBranchManager(e.target.value)}
                      />
                    </div> */}
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('transcription')}:</label>
                      <textarea
                        className=" border border-bgray-300 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        rows={8}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={Helpers.getTranslationValue('transcription')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('summary')}:</label>
                      <textarea
                        className=" border border-bgray-300 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        rows={8}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder={Helpers.getTranslationValue('summary')}
                      />
                    </div>
                    {/* <div className="mb-4">
                      <label className="">{Helpers.getTranslationValue('Email')}:</label>
                      <input
                        type="email"
                        placeholder={Helpers.getTranslationValue('Email')}
                        className=" border border-bgray-300  h-14 w-full focus:border-success-300 focus:ring-0 rounded-lg px-4 py-3.5 placeholder:text-base"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div> */}
                    <button
                      type="submit"
                      className="mt-6 py-3.5 flex items-center justify-center text-white  font-bold bg-success-300 hover:bg-success-300 transition-all rounded-lg w-full"
                      disabled={loading}
                    >
                      {Helpers.getTranslationValue(loading ? 'sending..' : 'send_transcription')}
                    </button>
                    <button
                      type="button"
                      className="mt-4 py-3.5 flex items-center justify-center bg-gray-300   rounded-lg w-full hover:bg-gray-400 "
                      onClick={back}
                    >
                      {Helpers.getTranslationValue('Back')}
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

export default ResendEmail;
