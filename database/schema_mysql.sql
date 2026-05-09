-- MySQL schema for Feedback Management System.
-- Host: localhost | Database: feedback_db

DROP DATABASE IF EXISTS feedback_db;
CREATE DATABASE feedback_db;
USE feedback_db;

CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE app_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  active TINYINT(1) DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES app_users(id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE questions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(1000) NOT NULL,
  type VARCHAR(30) NOT NULL,
  rating_min INT,
  rating_max INT,
  active TINYINT(1) DEFAULT 1 NOT NULL,
  cloned_from_question_id BIGINT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT ck_questions_type CHECK (type IN ('TEXT','RATING','YES_NO','MCQ')),
  CONSTRAINT fk_questions_creator FOREIGN KEY (created_by) REFERENCES app_users(id),
  CONSTRAINT fk_questions_clone FOREIGN KEY (cloned_from_question_id) REFERENCES questions(id)
);

CREATE TABLE choices (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT NOT NULL,
  label VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  active TINYINT(1) DEFAULT 1 NOT NULL,
  CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE feedback_cycles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(1000),
  status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL,
  start_date DATE,
  end_date DATE,
  cloned_from_cycle_id BIGINT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT ck_cycle_status CHECK (status IN ('DRAFT','SENT','CLOSED')),
  CONSTRAINT fk_cycle_creator FOREIGN KEY (created_by) REFERENCES app_users(id),
  CONSTRAINT fk_cycle_clone FOREIGN KEY (cloned_from_cycle_id) REFERENCES feedback_cycles(id)
);

CREATE TABLE feedback_cycle_questions (
  cycle_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  sort_order INT DEFAULT 0 NOT NULL,
  CONSTRAINT pk_cycle_questions PRIMARY KEY (cycle_id, question_id),
  CONSTRAINT fk_cq_cycle FOREIGN KEY (cycle_id) REFERENCES feedback_cycles(id) ON DELETE CASCADE,
  CONSTRAINT fk_cq_question FOREIGN KEY (question_id) REFERENCES questions(id)
);

CREATE TABLE feedback_assignments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  cycle_id BIGINT NOT NULL,
  assigned_to BIGINT NOT NULL,
  assigned_by BIGINT NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT uq_assignment UNIQUE (cycle_id, assigned_to),
  CONSTRAINT ck_assignment_status CHECK (status IN ('PENDING','SUBMITTED','APPROVED','REJECTED')),
  CONSTRAINT fk_assignment_cycle FOREIGN KEY (cycle_id) REFERENCES feedback_cycles(id),
  CONSTRAINT fk_assignment_user FOREIGN KEY (assigned_to) REFERENCES app_users(id),
  CONSTRAINT fk_assignment_sender FOREIGN KEY (assigned_by) REFERENCES app_users(id)
);

CREATE TABLE responses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  choice_id BIGINT,
  answer_text TEXT,
  rating_value INT,
  yes_no_value TINYINT(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_response UNIQUE (assignment_id, question_id),
  CONSTRAINT fk_response_assignment FOREIGN KEY (assignment_id) REFERENCES feedback_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_response_question FOREIGN KEY (question_id) REFERENCES questions(id),
  CONSTRAINT fk_response_choice FOREIGN KEY (choice_id) REFERENCES choices(id)
);

CREATE TABLE approvals (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id BIGINT NOT NULL UNIQUE,
  approved_by BIGINT NOT NULL,
  status VARCHAR(30) NOT NULL,
  comments VARCHAR(1000),
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT ck_approval_status CHECK (status IN ('APPROVED','REJECTED')),
  CONSTRAINT fk_approval_assignment FOREIGN KEY (assignment_id) REFERENCES feedback_assignments(id),
  CONSTRAINT fk_approval_user FOREIGN KEY (approved_by) REFERENCES app_users(id)
);

CREATE TABLE notification_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  assignment_id BIGINT NOT NULL,
  recipient_email VARCHAR(180) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body VARCHAR(2000) NOT NULL,
  status VARCHAR(30) DEFAULT 'SIMULATED' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_notification_assignment FOREIGN KEY (assignment_id) REFERENCES feedback_assignments(id)
);

CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_assignments_user ON feedback_assignments(assigned_to, status);
CREATE INDEX idx_assignments_cycle ON feedback_assignments(cycle_id);
CREATE INDEX idx_responses_question ON responses(question_id);

INSERT INTO roles(name) VALUES ('ADMIN');
INSERT INTO roles(name) VALUES ('MANAGER');
INSERT INTO roles(name) VALUES ('EMPLOYEE');

-- BCrypt hash for Password123!
INSERT INTO app_users(full_name, email, password_hash, department) VALUES
('System Admin', 'admin@example.com', '$2a$12$yTC1202NanpnADj8SBeFf.vpLz1uTS/A3FAi8MTz94AzfBMZf73Si', 'IT');
INSERT INTO app_users(full_name, email, password_hash, department) VALUES
('Feedback Manager', 'manager@example.com', '$2a$12$yTC1202NanpnADj8SBeFf.vpLz1uTS/A3FAi8MTz94AzfBMZf73Si', 'People');
INSERT INTO app_users(full_name, email, password_hash, department) VALUES
('Employee User', 'employee@example.com', '$2a$12$yTC1202NanpnADj8SBeFf.vpLz1uTS/A3FAi8MTz94AzfBMZf73Si', 'Operations');

INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM app_users u, roles r WHERE u.email='admin@example.com' AND r.name='ADMIN';
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM app_users u, roles r WHERE u.email='manager@example.com' AND r.name='MANAGER';
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id FROM app_users u, roles r WHERE u.email='employee@example.com' AND r.name='EMPLOYEE';
