-- Supabase PostgreSQL Schema for Tranquiloo App
-- Clean schema without neondb_owner references

-- Anxiety analyses table
CREATE TABLE public.anxiety_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    message_id uuid,
    anxiety_level integer NOT NULL,
    analysis_source text DEFAULT 'claude'::text,
    anxiety_triggers text[],
    coping_strategies text[],
    personalized_response text,
    confidence_score numeric(3,2),
    created_at timestamp without time zone DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    user_id text NOT NULL,
    content text NOT NULL,
    sender text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

-- Chat sessions table
CREATE TABLE public.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    title text DEFAULT 'New Chat Session'::text,
    ai_companion text DEFAULT 'vanessa'::text,
    language text DEFAULT 'english'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Email queue table
CREATE TABLE public.email_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    to_email text NOT NULL,
    from_email text DEFAULT 'info@tranquiloo-app.com'::text,
    subject text NOT NULL,
    html_content text NOT NULL,
    text_content text,
    email_type text NOT NULL,
    status text DEFAULT 'pending'::text,
    metadata text,
    sent_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);

-- Goal progress table
CREATE TABLE public.goal_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    goal_id uuid NOT NULL,
    score integer NOT NULL,
    notes text,
    recorded_at text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

-- Intervention summaries table
CREATE TABLE public.intervention_summaries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    week_start text NOT NULL,
    week_end text NOT NULL,
    intervention_type text DEFAULT 'cbt'::text,
    conversation_count integer DEFAULT 0,
    key_points text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    patient_code text,
    role text DEFAULT 'user'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    email_verified boolean DEFAULT false,
    email_verification_token text,
    password_reset_token text,
    password_reset_expires timestamp without time zone
);

-- Therapists table
CREATE TABLE public.therapists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    licensure text NOT NULL,
    specialty text[],
    insurance text[],
    practice_type text,
    accepting_patients boolean,
    accepts_uninsured boolean,
    years_of_experience integer,
    rating numeric(3,2),
    bio text,
    website text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- User goals table
CREATE TABLE public.user_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    frequency text NOT NULL,
    target_value numeric,
    unit text,
    start_date text NOT NULL,
    end_date text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

-- User therapists table
CREATE TABLE public.user_therapists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    therapist_name text NOT NULL,
    contact_method text NOT NULL,
    contact_value text NOT NULL,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    share_report boolean DEFAULT true
);

-- Primary key constraints
ALTER TABLE ONLY public.anxiety_analyses ADD CONSTRAINT anxiety_analyses_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chat_messages ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.chat_sessions ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.email_queue ADD CONSTRAINT email_queue_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.goal_progress ADD CONSTRAINT goal_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.intervention_summaries ADD CONSTRAINT intervention_summaries_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.therapists ADD CONSTRAINT therapists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_goals ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.user_therapists ADD CONSTRAINT user_therapists_pkey PRIMARY KEY (id);