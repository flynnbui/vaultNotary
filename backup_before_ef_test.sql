--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(20),
    email character varying(255),
    type character varying(20) NOT NULL,
    document_id character varying(50),
    passport_id character varying(50),
    business_registration_number character varying(100),
    business_name character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ck_customers_type CHECK (((type)::text = ANY ((ARRAY['Individual'::character varying, 'Business'::character varying])::text[])))
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: TABLE customers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.customers IS 'Customer/party information for individuals and businesses';


--
-- Name: COLUMN customers.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customers.type IS 'Customer type: Individual or Business';


--
-- Name: COLUMN customers.document_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customers.document_id IS 'National ID or government-issued document ID';


--
-- Name: COLUMN customers.passport_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customers.passport_id IS 'Passport number for identification';


--
-- Name: document_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document_files (
    id character varying(50) NOT NULL,
    document_id character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    content_type character varying(100) NOT NULL,
    s3_key character varying(500) NOT NULL,
    s3_bucket character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ck_document_files_content_type CHECK (((content_type)::text = ANY ((ARRAY['application/pdf'::character varying, 'image/jpeg'::character varying, 'image/png'::character varying, 'image/gif'::character varying, 'image/jpg'::character varying])::text[])))
);


ALTER TABLE public.document_files OWNER TO postgres;

--
-- Name: TABLE document_files; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.document_files IS 'File metadata for documents. Actual files stored in S3';


--
-- Name: COLUMN document_files.content_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_files.content_type IS 'MIME type of the file. Only PDF and image types allowed';


--
-- Name: COLUMN document_files.s3_key; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_files.s3_key IS 'S3 storage key in format: documents/{documentId}/{fileId}';


--
-- Name: COLUMN document_files.s3_bucket; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.document_files.s3_bucket IS 'S3 bucket name where the file is stored';


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id character varying(50) NOT NULL,
    created_date timestamp without time zone NOT NULL,
    secretary character varying(255) NOT NULL,
    notary_public character varying(255) NOT NULL,
    transaction_code character varying(100) NOT NULL,
    description text,
    document_type character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: TABLE documents; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.documents IS 'Core document metadata and information';


--
-- Name: COLUMN documents.created_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.documents.created_date IS 'Date when the document was originally created';


--
-- Name: COLUMN documents.notary_public; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.documents.notary_public IS 'Name of the notary public who notarized the document';


--
-- Name: COLUMN documents.transaction_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.documents.transaction_code IS 'Unique identifier for the notarial transaction';


--
-- Name: party_document_links; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.party_document_links (
    document_id character varying(50) NOT NULL,
    customer_id character varying(50) NOT NULL,
    party_role character varying(20) NOT NULL,
    signature_status character varying(20) NOT NULL,
    notary_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ck_party_document_links_party_role CHECK (((party_role)::text = ANY ((ARRAY['PartyA'::character varying, 'PartyB'::character varying, 'Witness'::character varying, 'Notary'::character varying, '0'::character varying, '1'::character varying, '2'::character varying, '3'::character varying])::text[]))),
    CONSTRAINT ck_party_document_links_signature_status CHECK (((signature_status)::text = ANY ((ARRAY['Pending'::character varying, 'Signed'::character varying, 'Rejected'::character varying, '0'::character varying, '1'::character varying, '2'::character varying])::text[])))
);


ALTER TABLE public.party_document_links OWNER TO postgres;

--
-- Name: TABLE party_document_links; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.party_document_links IS 'Many-to-many relationship between customers and documents with roles and signature status';


--
-- Name: COLUMN party_document_links.party_role; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.party_document_links.party_role IS 'Role in document: PartyA(0), PartyB(1), Witness(2), Notary(3)';


--
-- Name: COLUMN party_document_links.signature_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.party_document_links.signature_status IS 'Signature status: Pending(0), Signed(1), Rejected(2)';


--
-- Name: COLUMN party_document_links.notary_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.party_document_links.notary_date IS 'Date when the party was notarized';


--
-- Name: documents_with_details; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.documents_with_details AS
 SELECT d.id,
    d.created_date,
    d.secretary,
    d.notary_public,
    d.transaction_code,
    d.description,
    d.document_type,
    d.created_at,
    d.updated_at,
    count(f.id) AS file_count,
    count(pdl.customer_id) AS party_count,
    string_agg(DISTINCT (c.full_name)::text, ', '::text) AS party_names
   FROM (((public.documents d
     LEFT JOIN public.document_files f ON (((d.id)::text = (f.document_id)::text)))
     LEFT JOIN public.party_document_links pdl ON (((d.id)::text = (pdl.document_id)::text)))
     LEFT JOIN public.customers c ON (((pdl.customer_id)::text = (c.id)::text)))
  GROUP BY d.id, d.created_date, d.secretary, d.notary_public, d.transaction_code, d.description, d.document_type, d.created_at, d.updated_at;


ALTER TABLE public.documents_with_details OWNER TO postgres;

--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, full_name, address, phone, email, type, document_id, passport_id, business_registration_number, business_name, created_at, updated_at) FROM stdin;
customer-1	John Doe	123 Main St, Anytown, USA	+1-555-0123	john.doe@example.com	Individual	ID123456789	\N	\N	\N	2025-07-08 14:10:43.241413	2025-07-08 14:10:43.241413
customer-2	Jane Smith	456 Oak Ave, Somewhere, USA	+1-555-0124	jane.smith@example.com	Individual	ID987654321	\N	\N	\N	2025-07-08 14:10:43.241413	2025-07-08 14:10:43.241413
customer-3	ABC Corporation	789 Business Blvd, Corporate City, USA	+1-555-0125	contact@abccorp.com	Business	\N	\N	BRN123456789	ABC Corporation	2025-07-08 14:10:43.241413	2025-07-08 14:10:43.241413
f5817cd1-ce69-4042-8aea-402ed25cea47	Docker Customer	123 Container St	555-9999	docker@test.com	Individual	DOCKERID123	\N	\N	\N	2025-07-10 16:59:24.943431	2025-07-10 16:59:24.943431
309666a4-ef44-40ff-a1f8-f1338fa1ed8a	Party A Customer	123 Party A St	555-0001	partya@test.com	Individual	PARTYA123	\N	\N	\N	2025-07-10 17:18:43.603484	2025-07-10 17:18:43.603484
ff8ea0e0-2319-45e2-a4a7-8e68eedba0a8	Party B Customer	456 Party B Ave	555-0002	partyb@test.com	Individual	PARTYB456	\N	\N	\N	2025-07-10 17:18:48.026947	2025-07-10 17:18:48.026947
\.


--
-- Data for Name: document_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document_files (id, document_id, file_name, file_size, content_type, s3_key, s3_bucket, created_at, updated_at) FROM stdin;
file-1	doc-1	property-agreement.pdf	245760	application/pdf	files/doc-1/property-agreement.pdf	vaultnotary-files-prod	2025-07-08 14:10:43.247902	2025-07-08 14:10:43.247902
file-2	doc-2	partnership-agreement.pdf	189440	application/pdf	files/doc-2/partnership-agreement.pdf	vaultnotary-files-prod	2025-07-08 14:10:43.247902	2025-07-08 14:10:43.247902
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, created_date, secretary, notary_public, transaction_code, description, document_type, created_at, updated_at) FROM stdin;
doc-1	2024-01-15 10:00:00	Mary Johnson	Robert Wilson	TXN-2024-001	Property Purchase Agreement	Real Estate Contract	2025-07-08 14:10:43.2446	2025-07-08 14:10:43.2446
doc-2	2024-01-16 14:30:00	Mary Johnson	Robert Wilson	TXN-2024-002	Business Partnership Agreement	Partnership Contract	2025-07-08 14:10:43.2446	2025-07-08 14:10:43.2446
c176ab08-eb04-45cf-8b90-f68aed081679	-infinity	Docker Test	Container Notary	DOCKER001	Testing with docker compose	Test Agreement	2025-07-10 16:59:22.199828	2025-07-10 16:59:22.199828
2cb05310-a7e8-4433-906f-b46c423b4f5f	2025-07-10 17:01:06.799	string	string	string	string	string	2025-07-10 17:01:07.717714	2025-07-10 17:01:07.717714
d4a34efe-9c98-4bfd-b26c-528783b2057b	2025-07-10 17:01:06.799	string	string	123	string	string	2025-07-10 17:02:06.560007	2025-07-10 17:02:06.560007
83f485dc-e297-4a8a-b0fa-a8e6c1d34884	2025-07-10 17:01:06.799	string	string	999	string	string	2025-07-10 17:02:29.598979	2025-07-10 17:02:29.598979
4e011f86-a290-43ec-a56f-d2586857b3a4	2025-07-10 17:01:06.799	string	string	ABJHCBJHGD	string	string	2025-07-10 17:03:00.173294	2025-07-10 17:03:00.173294
90cd9baa-70c9-4c97-8213-ff80daa5958d	-infinity	Test Secretary	Test Notary	RANDOM123	Random test	Test Doc	2025-07-10 17:04:33.255875	2025-07-10 17:04:33.255875
0558d34d-9cd7-4236-9759-aa26e74ae97a	-infinity	Another Secretary	Another Notary	ABC789	Another test	Contract	2025-07-10 17:04:55.524711	2025-07-10 17:04:55.524711
8b4b42be-50ad-4f73-990f-64f33a01664d	-infinity	Dup Secretary	Dup Notary	DUPLICATE001	Duplicate test	Agreement	2025-07-10 17:04:58.075504	2025-07-10 17:04:58.075504
73303011-c6ff-4c19-9954-05a195fdf9c9	-infinity	New Secretary	New Notary	UNIQUE789	Testing unique code	New Contract	2025-07-10 17:07:33.745858	2025-07-10 17:07:33.745858
1eff80cc-2663-4fa5-9133-1407936d5de5	2025-07-10 17:01:06.799	string	string	ABDD	string	string	2025-07-10 17:08:05.49547	2025-07-10 17:08:05.49547
7e16cbd1-3fb9-48a5-9a83-272ee95a74af	-infinity	FK Test	FK Notary	FK_TEST_001	Testing FK violation	FK Contract	2025-07-10 17:16:40.485335	2025-07-10 17:16:40.485335
94e3eafc-4a14-42fc-ac5a-b921b0cd0abe	-infinity	Multi Test Secretary	Multi Test Notary	MULTI_PARTY_001	Testing multiple parties in single request	Multi-Party Agreement	2025-07-10 17:19:50.832372	2025-07-10 17:19:50.832372
bf301483-029a-49be-b7bb-dec254923a06	-infinity	Success Secretary	Success Notary	MIDDLEWARE_SUCCESS_001	Testing successful document creation with middleware	Success Document	2025-07-10 17:27:44.911861	2025-07-10 17:27:44.911861
\.


--
-- Data for Name: party_document_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.party_document_links (document_id, customer_id, party_role, signature_status, notary_date, created_at, updated_at) FROM stdin;
doc-1	customer-1	PartyA	Signed	2024-01-15 10:30:00	2025-07-08 14:10:43.246101	2025-07-08 14:10:43.246101
doc-1	customer-2	PartyB	Signed	2024-01-15 10:35:00	2025-07-08 14:10:43.246101	2025-07-08 14:10:43.246101
doc-2	customer-1	PartyA	Signed	2024-01-16 15:00:00	2025-07-08 14:10:43.246101	2025-07-08 14:10:43.246101
doc-2	customer-3	PartyB	Pending	2024-01-16 15:00:00	2025-07-08 14:10:43.246101	2025-07-08 14:10:43.246101
c176ab08-eb04-45cf-8b90-f68aed081679	f5817cd1-ce69-4042-8aea-402ed25cea47	PartyA	Pending	2025-07-10 17:00:00	2025-07-10 16:59:35.074346	2025-07-10 16:59:35.074346
94e3eafc-4a14-42fc-ac5a-b921b0cd0abe	309666a4-ef44-40ff-a1f8-f1338fa1ed8a	PartyA	Pending	2025-07-10 17:30:00	2025-07-10 17:19:50.839408	2025-07-10 17:19:50.839408
94e3eafc-4a14-42fc-ac5a-b921b0cd0abe	ff8ea0e0-2319-45e2-a4a7-8e68eedba0a8	PartyB	Pending	2025-07-10 17:30:00	2025-07-10 17:19:50.859708	2025-07-10 17:19:50.859708
bf301483-029a-49be-b7bb-dec254923a06	309666a4-ef44-40ff-a1f8-f1338fa1ed8a	PartyA	Pending	2025-07-10 17:30:00	2025-07-10 17:27:44.959328	2025-07-10 17:27:44.959328
\.


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: document_files document_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_files
    ADD CONSTRAINT document_files_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_transaction_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_transaction_code_key UNIQUE (transaction_code);


--
-- Name: party_document_links party_document_links_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.party_document_links
    ADD CONSTRAINT party_document_links_pkey PRIMARY KEY (document_id, customer_id);


--
-- Name: idx_customers_business_reg; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_business_reg ON public.customers USING btree (business_registration_number);


--
-- Name: idx_customers_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_document_id ON public.customers USING btree (document_id);


--
-- Name: idx_customers_full_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_full_name ON public.customers USING btree (full_name);


--
-- Name: idx_customers_passport_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_passport_id ON public.customers USING btree (passport_id);


--
-- Name: idx_documents_created_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_created_date ON public.documents USING btree (created_date);


--
-- Name: idx_documents_document_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_document_type ON public.documents USING btree (document_type);


--
-- Name: idx_documents_notary_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_notary_public ON public.documents USING btree (notary_public);


--
-- Name: idx_documents_secretary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_secretary ON public.documents USING btree (secretary);


--
-- Name: idx_documents_transaction_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_transaction_code ON public.documents USING btree (transaction_code);


--
-- Name: idx_files_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_document_id ON public.document_files USING btree (document_id);


--
-- Name: idx_files_s3_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_s3_key ON public.document_files USING btree (s3_key);


--
-- Name: idx_party_links_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_party_links_customer_id ON public.party_document_links USING btree (customer_id);


--
-- Name: idx_party_links_notary_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_party_links_notary_date ON public.party_document_links USING btree (notary_date);


--
-- Name: idx_party_links_party_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_party_links_party_role ON public.party_document_links USING btree (party_role);


--
-- Name: document_files document_files_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document_files
    ADD CONSTRAINT document_files_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: party_document_links party_document_links_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.party_document_links
    ADD CONSTRAINT party_document_links_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: party_document_links party_document_links_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.party_document_links
    ADD CONSTRAINT party_document_links_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

