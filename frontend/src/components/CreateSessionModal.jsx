import { Code2Icon, LoaderIcon, PlusIcon, AlertCircleIcon, UserIcon, UsersIcon, MailIcon, KeyIcon, SparklesIcon } from "lucide-react";
import { useQuestions } from "../hooks/useQuestions";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
  sessionType = "one_on_one",
}) {
  const { data: questions, isLoading: loadingQuestions, error } = useQuestions();

  if (!isOpen) return null;

  const isOneOnOne = sessionType === "one_on_one";

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-2">
          {isOneOnOne ? "Create One-on-One Session" : "Create Class Session"}
        </h3>
        <p className="text-base-content/60 mb-6">
          {isOneOnOne
            ? "Personalized tutoring with AI-generated feedback"
            : "Group session for multiple students"
          }
        </p>

        {/* Session Type Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-6 ${isOneOnOne ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
          {isOneOnOne ? <UserIcon className="size-4" /> : <UsersIcon className="size-4" />}
          {isOneOnOne ? "1:1 Tutoring" : "Class Session"}
        </div>

        <div className="space-y-8">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Question</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            {loadingQuestions ? (
              <div className="flex items-center gap-2 p-4">
                <LoaderIcon className="size-5 animate-spin" />
                <span>Loading questions...</span>
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <AlertCircleIcon className="size-5" />
                <span>Failed to load questions</span>
              </div>
            ) : questions?.length === 0 ? (
              <div className="alert alert-warning">
                <AlertCircleIcon className="size-5" />
                <span>No questions available. Teachers need to create questions first.</span>
              </div>
            ) : (
              <select
                className="select w-full"
                value={roomConfig.questionId || ""}
                onChange={(e) => {
                  const selectedQuestion = questions.find((q) => q._id === e.target.value);
                  if (selectedQuestion) {
                    setRoomConfig({
                      questionId: selectedQuestion._id,
                      problem: selectedQuestion.title,
                      difficulty: selectedQuestion.difficulty,
                    });
                  }
                }}
              >
                <option value="" disabled>
                  Choose a coding question...
                </option>

                {questions?.map((question) => (
                  <option key={question._id} value={question._id}>
                    {question.title} ({question.difficulty})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.questionId && (
            <div className="bg-base-200/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Code2Icon className="size-5" />
                Session Summary
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-base-content/50">Question</p>
                  <p className="font-medium">{roomConfig.problem}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Difficulty</p>
                  <p className="font-medium capitalize">{roomConfig.difficulty}</p>
                </div>
                <div>
                  <p className="text-base-content/50">Join Method</p>
                  <p className="font-medium flex items-center gap-1">
                    {isOneOnOne ? <><MailIcon className="size-4" /> Email Invite</> : <><KeyIcon className="size-4" /> Access Code</>}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50">AI Report</p>
                  <p className="font-medium flex items-center gap-1">
                    {isOneOnOne ? <><SparklesIcon className="size-4 text-primary" /> Enabled</> : <span className="text-base-content/50">Disabled</span>}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50">Participants</p>
                  <p className="font-medium">
                    {isOneOnOne ? "Max 2 (1:1)" : "Unlimited"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.questionId}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}

            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default CreateSessionModal;
