-- =====================================================================
-- AI Founder Assistant – Your Startup Co-Pilot
-- MySQL Database Schema with ON DELETE CASCADE Foreign Keys
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ai_founder_assistant
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_founder_assistant;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Startups Table (Owned by user_id)
CREATE TABLE IF NOT EXISTS startups (
    startup_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    startup_name VARCHAR(150) NOT NULL,
    industry VARCHAR(120) NOT NULL,
    execution_stage VARCHAR(60) NOT NULL DEFAULT 'Validation',
    tagline VARCHAR(255) DEFAULT '',
    problem_statement TEXT NOT NULL,
    proposed_solution TEXT NOT NULL,
    target_customers TEXT NOT NULL,
    business_model TEXT NOT NULL,
    estimated_investment DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    projected_monthly_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_startups_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Competitors Table (Linked to startup_id with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS competitors (
    competitor_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    competitor_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    pricing_model VARCHAR(150) DEFAULT '',
    threat_level VARCHAR(50) DEFAULT 'Moderate',
    their_strength TEXT,
    their_weakness TEXT,
    our_advantage TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_competitors_startup
        FOREIGN KEY (startup_id) REFERENCES startups(startup_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. SWOT Analysis Table (Linked to startup_id with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS swot_analysis (
    swot_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    category ENUM('Strength', 'Weakness', 'Opportunity', 'Threat') NOT NULL,
    title VARCHAR(255) NOT NULL,
    impact VARCHAR(30) DEFAULT 'High',
    details TEXT,
    action_plan TEXT,
    source VARCHAR(20) DEFAULT 'auto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_swot_startup
        FOREIGN KEY (startup_id) REFERENCES startups(startup_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tasks Table (Linked to startup_id with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(80) DEFAULT 'Product',
    priority VARCHAR(30) DEFAULT 'High',
    status VARCHAR(40) DEFAULT 'Todo',
    due_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_startup
        FOREIGN KEY (startup_id) REFERENCES startups(startup_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Startup Summary Table (Linked to startup_id with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS startup_summaries (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL UNIQUE,
    elevator_pitch TEXT,
    executive_overview TEXT,
    core_value_proposition TEXT,
    financial_snapshot TEXT,
    competitive_positioning TEXT,
    execution_status_summary TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_summary_startup
        FOREIGN KEY (startup_id) REFERENCES startups(startup_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. AI Suggestions Table (Linked to startup_id with ON DELETE CASCADE)
CREATE TABLE IF NOT EXISTS ai_suggestions (
    suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL UNIQUE,
    viability_score INT DEFAULT 80,
    overall_verdict TEXT,
    problem_solution_critique TEXT,
    target_customer_suggestions TEXT,
    business_model_suggestions TEXT,
    competitive_moat_suggestions TEXT,
    risk_mitigation_steps TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_startup
        FOREIGN KEY (startup_id) REFERENCES startups(startup_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
