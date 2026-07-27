"use client";

import type {
  Resume,
  ResumeEducation,
  ResumeWorkExperience,
} from "@/lib/schemas";
import {
  NullableTextField,
  StringListField,
  TextAreaField,
  TextField,
} from "./fields";

const EMPTY_WORK_EXPERIENCE: ResumeWorkExperience = {
  company: "",
  title: "",
  startDate: "",
  endDate: "",
  description: "",
};

const EMPTY_EDUCATION: ResumeEducation = {
  institution: "",
  degree: "",
  field: null,
  startDate: null,
  endDate: null,
};

export function ResumeEditor({
  data,
  onChange,
}: {
  data: Resume;
  onChange: (data: Resume) => void;
}) {
  function updateWorkExperience(index: number, patch: Partial<ResumeWorkExperience>) {
    const next = data.workExperience.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ ...data, workExperience: next });
  }

  function updateEducation(index: number, patch: Partial<ResumeEducation>) {
    const next = data.education.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ ...data, education: next });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Name"
          value={data.name}
          onChange={(v) => onChange({ ...data, name: v })}
        />
        <NullableTextField
          label="Email"
          value={data.email}
          onChange={(v) => onChange({ ...data, email: v })}
        />
        <NullableTextField
          label="Phone"
          value={data.phone}
          onChange={(v) => onChange({ ...data, phone: v })}
        />
        <NullableTextField
          label="Location"
          value={data.location}
          onChange={(v) => onChange({ ...data, location: v })}
        />
      </div>

      <TextAreaField
        label="Summary"
        value={data.summary}
        onChange={(v) => onChange({ ...data, summary: v })}
      />

      <StringListField
        label="Skills"
        values={data.skills}
        onChange={(skills) => onChange({ ...data, skills })}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Work experience
          </h3>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                workExperience: [...data.workExperience, { ...EMPTY_WORK_EXPERIENCE }],
              })
            }
            className="rounded px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            + Add job
          </button>
        </div>
        {data.workExperience.length === 0 && (
          <p className="text-sm text-neutral-400">No work experience yet.</p>
        )}
        {data.workExperience.map((job, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Company"
                value={job.company}
                onChange={(v) => updateWorkExperience(index, { company: v })}
              />
              <TextField
                label="Title"
                value={job.title}
                onChange={(v) => updateWorkExperience(index, { title: v })}
              />
              <TextField
                label="Start date"
                value={job.startDate}
                onChange={(v) => updateWorkExperience(index, { startDate: v })}
              />
              <TextField
                label="End date"
                value={job.endDate}
                onChange={(v) => updateWorkExperience(index, { endDate: v })}
              />
            </div>
            <TextAreaField
              label="Description"
              value={job.description}
              onChange={(v) => updateWorkExperience(index, { description: v ?? "" })}
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  workExperience: data.workExperience.filter((_, i) => i !== index),
                })
              }
              className="self-start rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Education
          </h3>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...data,
                education: [...data.education, { ...EMPTY_EDUCATION }],
              })
            }
            className="rounded px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            + Add education
          </button>
        </div>
        {data.education.length === 0 && (
          <p className="text-sm text-neutral-400">No education entries yet.</p>
        )}
        {data.education.map((edu, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                label="Institution"
                value={edu.institution}
                onChange={(v) => updateEducation(index, { institution: v })}
              />
              <TextField
                label="Degree"
                value={edu.degree}
                onChange={(v) => updateEducation(index, { degree: v })}
              />
              <NullableTextField
                label="Field of study"
                value={edu.field}
                onChange={(v) => updateEducation(index, { field: v })}
              />
              <NullableTextField
                label="Start date"
                value={edu.startDate}
                onChange={(v) => updateEducation(index, { startDate: v })}
              />
              <NullableTextField
                label="End date"
                value={edu.endDate}
                onChange={(v) => updateEducation(index, { endDate: v })}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...data,
                  education: data.education.filter((_, i) => i !== index),
                })
              }
              className="self-start rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
