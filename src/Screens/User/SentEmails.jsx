import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Helpers from "../../Config/Helpers";
import { useHeader } from "../../Components/HeaderContext";

const SentEmails = () => {

  const { setHeaderData } = useHeader();
  useEffect(() => {
    setHeaderData({ title: Helpers.getTranslationValue('emails_sent'), desc: "" });
  }, [setHeaderData]);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${Helpers.apiUrl}getSentEmails`, Helpers.authHeaders);
        setEmails(response.data.emails);
        setFilteredEmails(response.data.emails);
        setIsLoading(false);
      } catch (error) {
        setError(Helpers.getTranslationValue('sent_emails_retrieve_error'));
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  useEffect(() => {
    const results = emails.filter(email => {
      const name = email.email ? email.email.toLowerCase() : "";
      const title = email.transcriptionText ? email.transcriptionText.toLowerCase() : "";
      return (
        name.includes(searchTerm.toLowerCase()) ||
        title.includes(searchTerm.toLowerCase())
      );
    });
    setFilteredEmails(results);
  }, [searchTerm, emails]);

  const handleEmailClick = (email) => {
    navigate(`/resend-email/${email.id}`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-grow p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-3">
            <div className="flex justify-between items-center flex-wrap mb-4">
              <h2 className="text-2xl font-bold  mb-4 sm:mb-0">{Helpers.getTranslationValue('emails_sent')}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <input
                  type="text"
                  placeholder={Helpers.getTranslationValue('search_mails')}
                  className="py-2 px-3  mr-2 border rounded w-full sm:w-auto focus:outline-none focus:border-success-300"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Link
                  to="/voice"
                  className="h-10  px-5 mb-2 text-white  transition-colors duration-150 bg-success-300 rounded-lg focus:shadow-outline hover:bg-success-300 flex items-center justify-center w-1/2 md:w-1/2"
                >
                  {Helpers.getTranslationValue('voice_assistant')}
                </Link>
              </div>
            </div>
          </div>

          <div className="shadow rounded-lg">
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-3">
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C6.48 0 0 6.48 0 14h4zm2 5.291A7.952 7.952 0 014 12H0c0 2.892 1.168 5.515 3.063 7.063L6 17.291z"></path>
                    </svg>
                  </div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-100 text-blue-700 rounded">{error}</div>
              ) : (
                <ul className="divide-y divide-gray-200 text-wrap">
                  {filteredEmails.map((email, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center py-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEmailClick(email)}
                    >
                      <div>
                        <div className="font-bold ">{email.title}</div>
                        <div className="">
                          {email.transcriptionText ? `${email.transcriptionText.substring(0, 70)}${email.transcriptionText.length > 70 ? '...' : ''}` : ''}
                        </div>
                        {email.transcriptionText && email.transcriptionText.length > 70 && (
                          <div className="text-sm ">{Helpers.getTranslationValue('view_full_email')}</div>
                        )}
                        <small className="">{email.email}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentEmails;
