// src/components/chapters/tabs/BasicInfoTab.tsx
import React, { forwardRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import { useChapterFormStore } from '../../../stores/chapterFormStore';
import { useModels, type Model } from '../../../hooks/queries/useModels';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Validation schema for the basic info form
const BasicInfoSchema = Yup.object().shape({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .required('Title is required'),
  subject: Yup.string()
    .min(1, 'Subject is required')
    .max(255, 'Subject must be less than 255 characters')
    .required('Subject is required'),
  topic: Yup.string()
    .min(1, 'Topic is required')
    .max(255, 'Topic must be less than 255 characters')
    .required('Topic is required'),
  chat_model_id: Yup.string().optional(),
  tracking_model_id: Yup.string().optional(),
});

interface FormValues {
  title: string;
  subject: string;
  topic: string;
  chat_model_id: string;
  tracking_model_id: string;
}

const BasicInfoTab = forwardRef<FormikProps<FormValues>>((props, ref) => {
  // Get form data from Zustand store
  const {
    title,
    subject,
    topic,
    chat_model_id,
    tracking_model_id,
    updateField,
  } = useChapterFormStore();

  // Use the models query hook
  const { data: availableModels = [], isLoading: modelsLoading } = useModels();

  // Initial values for Formik
  const initialValues: FormValues = {
    title: title || '',
    subject: subject || '',
    topic: topic || '',
    chat_model_id: chat_model_id || '',
    tracking_model_id: tracking_model_id || '',
  };

  const handleSubmit = (values: FormValues) => {
    console.log('BasicInfoTab handleSubmit called with:', values);
    // Update Zustand store with validated values
    Object.entries(values).forEach(([field, value]) => {
      updateField(field, value);
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={BasicInfoSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      innerRef={ref}
      validateOnMount={false}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isValid, validateForm }) => {
        // Update Zustand store when values change
        React.useEffect(() => {
          Object.entries(values).forEach(([field, value]) => {
            updateField(field, value);
          });
        }, [values, updateField]);

        // Debug logging
        React.useEffect(() => {
          console.log('Formik state:', { values, errors, touched, isValid });
        }, [values, errors, touched, isValid]);

        return (
          <Form className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Title *
              </Label>
              <Field
                as={Input}
                id="title"
                name="title"
                type="text"
                placeholder="Enter chapter title"
                className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                  errors.title && touched.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.title && touched.title && (
                <div className="text-sm text-red-600 mt-1">{errors.title}</div>
              )}
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                Subject *
              </Label>
              <Field
                as={Input}
                id="subject"
                name="subject"
                type="text"
                placeholder="Enter subject area"
                className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                  errors.subject && touched.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.subject && touched.subject && (
                <div className="text-sm text-red-600 mt-1">{errors.subject}</div>
              )}
            </div>

            {/* Topic Field */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium text-slate-700">
                Topic *
              </Label>
              <Field
                as={Input}
                id="topic"
                name="topic"
                type="text"
                placeholder="Enter specific topic"
                className={`border-slate-200 focus:border-violet-300 focus:ring-violet-200 ${
                  errors.topic && touched.topic ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                }`}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {errors.topic && touched.topic && (
                <div className="text-sm text-red-600 mt-1">{errors.topic}</div>
              )}
            </div>

            {/* Chat Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="chat_model_id" className="text-sm font-medium text-slate-700">
                Chat Model
              </Label>
              {modelsLoading ? (
                <div className="text-slate-500 text-sm">Loading models...</div>
              ) : (
                <Select
                  value={values.chat_model_id}
                  onValueChange={(value) => setFieldValue('chat_model_id', value)}
                >
                  <SelectTrigger className="border-slate-200 focus:border-violet-300 focus:ring-violet-200">
                    <SelectValue placeholder="Select Chat Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model: Model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.chat_model_id && touched.chat_model_id && (
                <div className="text-sm text-red-600 mt-1">{errors.chat_model_id}</div>
              )}
            </div>

            {/* Tracking Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="tracking_model_id" className="text-sm font-medium text-slate-700">
                Progress Tracking Model
              </Label>
              {modelsLoading ? (
                <div className="text-slate-500 text-sm">Loading models...</div>
              ) : (
                <Select
                  value={values.tracking_model_id}
                  onValueChange={(value) => setFieldValue('tracking_model_id', value)}
                >
                  <SelectTrigger className="border-slate-200 focus:border-violet-300 focus:ring-violet-200">
                    <SelectValue placeholder="Select Progress Tracking Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model: Model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.tracking_model_id && touched.tracking_model_id && (
                <div className="text-sm text-red-600 mt-1">{errors.tracking_model_id}</div>
              )}
            </div>

            {/* Hidden submit button for Formik validation */}
            <button type="submit" style={{ display: 'none' }} />
          </Form>
        );
      }}
    </Formik>
  );
});

BasicInfoTab.displayName = 'BasicInfoTab';

export default BasicInfoTab;
